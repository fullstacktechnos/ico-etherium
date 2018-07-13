rsync -r src/ docs/
rsync build/contracts/* docs/
git add .
git commit -m "Compiles assets for github pages"
git push origin2 master