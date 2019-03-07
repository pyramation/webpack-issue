const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
var ManifestPlugin = require('webpack-manifest-plugin');

function getVendorEntries(basePath, dependencies) {
  return dependencies.reduce((prev, dependency) => {
    const depPath = path.join(basePath, 'node_modules', dependency);

    const files = fs
      .readdirSync(depPath)
      .filter(file => {
        return (
          (path.extname(file) === '.js' || path.extname(file) === '.css') &&
          file !== path.basename(basePath)
        );
      })
      .map(file => path.join(dependency, file));

    return [...prev, ...files];
  }, []);
}
const packageJSON = path.join(__dirname, '/package.json');
const dependencies = Object.keys(
  JSON.parse(fs.readFileSync(packageJSON).toString()).dependencies
);
const vendors = [...dependencies, ...getVendorEntries(__dirname, dependencies)];

const webpackConfig = {
  entry: vendors,
  output: {
    path: __dirname,
    filename: '[name].[chunkhash].js'
  },
  plugins: [new ManifestPlugin()]
};

const compiler = webpack(webpackConfig);

compiler.run(err => {
  console.log(err);
  console.log('done!');
});
