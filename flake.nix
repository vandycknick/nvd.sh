{
  description = "website";

  inputs = {
    nixpkgs-terraform.url = "github:stackbuilders/nixpkgs-terraform";
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    systems.url = "github:nix-systems/default";
  };

  nixConfig = {
    extra-substituters = "https://nixpkgs-terraform.cachix.org";
    extra-trusted-public-keys = "nixpkgs-terraform.cachix.org-1:8Sit092rIdAVENA3ZVeH9hzSiqI/jng6JiCrQ1Dmusw=";
  };

  outputs =
    {
      self,
      nixpkgs,
      nixpkgs-terraform,
      systems,
    }:
    let
      forEachSystem = nixpkgs.lib.genAttrs (import systems);
    in
    {
      devShells = forEachSystem (
        system:
        let
          pkgs = import nixpkgs {
            inherit system;
            config = {
              allowUnfreePredicate = pkg: builtins.elem (pkgs.lib.getName pkg) [ "terraform" ];
            };
            overlays = [ nixpkgs-terraform.overlays.default ];

          };
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.gnumake
              pkgs.nodejs_24
              pkgs.oxlint
              pkgs.nodePackages.pnpm
              pkgs."terraform-1.14"
              pkgs.tflint
            ];
            shellHook = ''
              make install
            '';
          };
        }
      );
    };
}
