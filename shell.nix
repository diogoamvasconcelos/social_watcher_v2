{ }:
let
  nixpkgs = import (builtins.fetchTarball {
    name = "nixpkgs-stable-release-20.09";
    url = "https://github.com/NixOS/nixpkgs/archive/20.09.tar.gz";
    # Hash obtained using nix-prefetch-url --unpack <url>
    sha256 = "1wg61h4gndm3vcprdcg7rc4s1v3jkm5xd7lw8r2f67w502y94gcy";
  }) { };
in nixpkgs.mkShell {
  buildInputs = with nixpkgs; [
    nodejs-14_x
    jq
    # yarn pins the node version to 10...
    (yarn.override { nodejs = nixpkgs.nodejs-14_x; })
  ];
}