{
  description = "website";

  inputs = {
    nixpkgs-terraform.url = "github:stackbuilders/nixpkgs-terraform";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    systems.url = "github:nix-systems/default";
  };

  nixConfig = {
    extra-substituters = "https://nixpkgs-terraform.cachix.org";
    extra-trusted-public-keys =
      "nixpkgs-terraform.cachix.org-1:8Sit092rIdAVENA3ZVeH9hzSiqI/jng6JiCrQ1Dmusw=";
  };

  outputs = { self, nixpkgs, nixpkgs-terraform, systems }:
    let forEachSystem = nixpkgs.lib.genAttrs (import systems);
    in {
      devShells = forEachSystem (system:
        let
          pkgs = import nixpkgs {
            inherit system;
            config = {
              allowUnfreePredicate = pkg:
                builtins.elem (pkgs.lib.getName pkg) [ "terraform" ];
            };
            overlays = [ nixpkgs-terraform.overlays.default ];

          };
        in {
          default = pkgs.mkShell {
            packages = [
              pkgs.gnumake
              pkgs.nodejs_24
              pkgs.oxlint
              pkgs.nodePackages.pnpm
              pkgs.terraform-versions."1.12"
              pkgs.tflint
            ];
            shellHook = ''
              [ -n "$NO_SHELL_HOOK" ] && exit 0
              make install
            '';
          };
        });
    };
}
