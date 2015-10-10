rm -rf ./npm
mkdir ./npm

cp ./bitter-apple.js ./npm/bitter-apple.js
cp ./bitter-apple-gherkin.js ./npm/bitter-apple-gherkin.js
cp ../package.json ./npm/package.json
cp ../../LICENSE ./npm/LICENSE
cp ../../README.md ./npm/README.md

cd ./npm
npm publish

rm -rf ../npm
