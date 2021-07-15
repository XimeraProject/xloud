let
  awsKeyId = "AKIAI6QCDKDFAZFL5D5A";
  region = "us-east-2";
  pkgs = import <nixpkgs> {};
  lib = import <nixpkgs/lib>;
in
{
  network.description = "ximera.xloud"; # the mispelling is a bit of a joke

  resources.ec2KeyPairs.myKeyPair = {
    accessKeyId = awsKeyId;
    inherit region;
  };

  resources.elasticIPs.myIP = {
    inherit region;
    accessKeyId = awsKeyId;
  };
  
  resources.ec2SecurityGroups.openPorts = { resources, lib, ... }: {
    accessKeyId = awsKeyId;
    inherit region;
    description = "Open ports for webserver";
    rules = [
      { toPort = 22; fromPort = 22; sourceIp = "0.0.0.0/0"; } # SSH
      { toPort = 80; fromPort = 80; sourceIp = "0.0.0.0/0"; } # HTTP
      { toPort = 443; fromPort = 443; sourceIp = "0.0.0.0/0"; } # HTTPS
    ];
  };

  server = { resources, config, nodes, ... }:
  let
    # build the backend node app
    app = import ./default.nix;
    texliveVersion=lib.head (lib.splitString "-" (lib.elemAt (lib.splitString "/"
      (builtins.unsafeDiscardStringContext pkgs.texlive.combined.scheme-full)) 3));
    texmfRoot= "${pkgs.texlive.combined.scheme-full}/share/texmf";    
  in {
    # Cloud provider settings; here for AWS
    deployment.targetEnv = "ec2";
    deployment.ec2.accessKeyId = awsKeyId;
    deployment.ec2.region = region;
    deployment.ec2.instanceType = "t2.micro"; # a cheap one
    deployment.ec2.ebsInitialRootDiskSize = 20; # GB
    deployment.ec2.elasticIPv4 = resources.elasticIPs.myIP;
    deployment.ec2.keyPair = resources.ec2KeyPairs.myKeyPair;
    deployment.ec2.associatePublicIpAddress = true;
    deployment.ec2.securityGroups = [ resources.ec2SecurityGroups.openPorts.name ];

    environment.systemPackages = with pkgs; [
      pkgs.redis pkgs.nginx pkgs.texlive.combined.scheme-full
      app
    ];
    
    services.redis.enable = true;

    services.nginx = {
      enable = true;

      # Use recommended settings
      recommendedGzipSettings = true;
      recommendedOptimisation = true;
      recommendedProxySettings = true;
      recommendedTlsSettings = true;

      upstreams."backend" = {
        servers = {
          "127.0.0.1:8000" = {};
        };
      };
    };

    services.nginx.virtualHosts."ximera.cloud" = {
      forceSSL = true;
      enableACME = true;
      default = true;
      root = "${app}/libexec/@ximera/xloud/deps/@ximera/xloud/dist";
      locations = {
        "${texliveVersion}" = {
          root = texmfRoot;
        };
        "=/favicon.ico" = {
          root = "${app}/libexec/@ximera/xloud/deps/@ximera/xloud/public/favicon";          
        };
        "/" = {
          tryFiles = "$uri @proxy";
        };
        "@proxy".proxyPass = http://backend;
      };
    };

    security.acme.acceptTerms = true;
    
    security.acme.certs = {
      "ximera.cloud".email = "admin@ximera.cloud";
    };
    
    systemd.services.node = {
      description = "node service";
      
      after = [ "network.target" ];
      wantedBy = [ "default.target" ];
      
      environment = {
        NODE_ENV = "production";

        TEXLIVE_VERSION=texliveVersion;
        TEXMF = texmfRoot;
        PORT = toString 8000;

        GITHUB_ACCESS_TOKEN=builtins.readFile ./github.key;
      };
      
      serviceConfig = {
        ExecStart = "${app}/bin/ximera-xloud";
        User = "node";
        Restart = "always";
      };
    };

    # for "security" do not run the node app as root
    users.extraUsers = {
      node = { isNormalUser = true; };
    };
    
    networking.firewall.allowedTCPPorts = [ 80 443 ];
  };
}


