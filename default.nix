{ stdenv, yarn2nix, texlive }:
yarn2nix.mkYarnPackage rec {
    name = "xloud";
    src = ./.;
    packageJSON = ./package.json;
    yarnLock = ./yarn.lock;
    yarnNix = ./yarn.nix;
    postBuild = ''
      yarn run lsr2json ${texlive.combined.scheme-full}/share/texmf/ls-R src/lsr.json
      NODE_ENV=production yarn run build
    '';

    meta = with stdenv.lib; {
      description = "Interactively view TeX files on GitHub";
      license = licenses.agpl3;
      homepage = "https://github.com/XimeraProject/xloud";
      maintainers = with maintainers; [ kisonecat ];
      platforms = platforms.linux;
    };
}
