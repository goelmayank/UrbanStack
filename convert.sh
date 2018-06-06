#!/bin/sh
input="$1"
parse="${input%.*}"
echo 'Converting '"$parse"'.sh to '"$parse"'.js!'
echo "const shell = require('shelljs');" | cat > "$parse".js
sed '1d' "$input" > tmpfile
awk '{ printf "shell.exec(\""; print }' tmpfile >> temp.js
sed 's/$/\");/' temp.js >> "$parse".js
sudo rm temp.js
sudo rm tmpfile
exit 0
