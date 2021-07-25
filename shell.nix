{ }:
let
  nixpkgs = import (builtins.fetchTarball {
    name = "nixpkgs-stable-release-21.05";
    url = "https://github.com/NixOS/nixpkgs/archive/21.05.tar.gz";
    # Hash obtained using `nix-prefetch-url --unpack <url>`
    sha256 = "1ckzhh24mgz6jd1xhfgx0i9mijk6xjqxwsshnvq789xsavrmsc36";
  }) { };
in nixpkgs.mkShell {
  buildInputs = with nixpkgs; [
    nodejs-14_x
    jq
    # yarn pins the node version to 10...
    (yarn.override { nodejs = nixpkgs.nodejs-14_x; })
  ];
}