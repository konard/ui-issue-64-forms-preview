set -euo pipefail
keyring=/etc/apt/keyrings/githubcli-archive-keyring.gpg
mkdir -p -m 755 /etc/apt/keyrings
tmp_keyring="$(mktemp)"
wget -nv -O "$tmp_keyring" https://cli.github.com/packages/githubcli-archive-keyring.gpg
# Fail unless the downloaded keyring is the GitHub CLI signing key.
gpg --show-keys --with-colons "$tmp_keyring" | grep -q '^fpr:::::::::2C6106201985B60E6C7AC87323F3D4EA75716059:$'
install -m 644 "$tmp_keyring" "$keyring"
rm -f "$tmp_keyring"
echo "deb [arch=$(dpkg --print-architecture) signed-by=$keyring] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list
apt-get update
apt-get install -y --no-install-recommends gh
gh --version
