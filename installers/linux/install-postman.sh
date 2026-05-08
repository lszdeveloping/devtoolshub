#!/usr/bin/env bash
set -e
wget -q "https://dl.pstmn.io/download/latest/linux64" -O /tmp/postman.tar.gz
sudo tar -xzf /tmp/postman.tar.gz -C /opt
sudo ln -sf /opt/Postman/Postman /usr/local/bin/postman
cat > ~/.local/share/applications/postman.desktop <<EOF
[Desktop Entry]
Name=Postman
Exec=/opt/Postman/Postman
Icon=/opt/Postman/app/resources/app/assets/icon.png
Type=Application
Categories=Development;
EOF
echo "Postman installed"
