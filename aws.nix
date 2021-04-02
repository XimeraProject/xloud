let
  awsKeyId = "AKIAI6QCDKDFAZFL5D5A"; # for fowler@rossprogram.org
  region = "us-east-2";
  pkgs = import <nixpkgs> {};
in
{
  network.description = "xloud.rossprogram.org";

  resources.ec2KeyPairs.myKeyPair = {
    accessKeyId = awsKeyId;
    inherit region;
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
    app = pkgs.callPackage ./default.nix {
      yarn2nix = pkgs.yarn2nix-moretea;
      texlive = pkgs.texlive;
    };
  in {
    # Cloud provider settings; here for AWS
    deployment.targetEnv = "ec2";
    deployment.ec2.accessKeyId = awsKeyId;
    deployment.ec2.region = region;
    deployment.ec2.instanceType = "t2.micro"; # a cheap one
    deployment.ec2.ebsInitialRootDiskSize = 20; # GB
    deployment.ec2.keyPair = resources.ec2KeyPairs.myKeyPair;
    deployment.ec2.associatePublicIpAddress = true;
    deployment.ec2.securityGroups = [ resources.ec2SecurityGroups.openPorts.name ];

    environment.systemPackages = with pkgs; [
      pkgs.mongodb pkgs.nginx pkgs.texlive.combined.scheme-full
      app
    ];
    
    services.mongodb.enable = true;

    services.nginx = {
      enable = true;

      # Use recommended settings
      recommendedGzipSettings = true;
      recommendedOptimisation = true;
      recommendedProxySettings = true;
      recommendedTlsSettings = true;
    };

    services.nginx.virtualHosts."xloud.rossprogram.org" = {
      forceSSL = true;
      enableACME = true;
      default = true;
      root = "/var/www/xloud.rossprogram.org";
      locations = {
        "/".proxyPass = "http://localhost:${config.systemd.services.node.environment.PORT}/";
        "/".proxyWebsockets = true;
      };
    };

    security.acme.acceptTerms = true;
    
    security.acme.certs = {
      "xloud.rossprogram.org".email = "fowler@rossprogram.org";
    };
    
    systemd.services.node = {
      description = "node service";
      
      after = [ "network.target" ];
      wantedBy = [ "default.target" ];
      
      environment = {
        NODE_ENV = "production";

        TEXLIVE_VERSION=(lib.splitString "-" (lib.splitString "/" pkgs.texlive.combined.scheme-full)[2])[0];
        TEXMF = "${pkgs.texlive.combined.scheme-full}/share/texmf";
        PORT = toString 8000;

        MONGODB_DATABASE = "xloud";
        MONGODB_PORT = toString 27017;

        GITHUB_ACCESS_TOKEN=builtins.readFile ./github.key;        
      };
      
      serviceConfig = {
        ExecStart = "${app}/bin/xloud";
        User = "node";
        Restart = "always";
      };
    };

    # for "security" do not run the node app as root
    users.extraUsers = {
      node = { };
    };
    
    networking.firewall.allowedTCPPorts = [ 80 443 ];
  };
}


