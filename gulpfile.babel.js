import gulp from 'gulp';
import browserify from 'browserify';
import watchify from 'watchify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import eslint from 'gulp-eslint';
import babelify from 'babelify';
import uglify from 'gulp-uglify-es';
import rimraf from 'rimraf';
import notify from 'gulp-notify';
import browserSync, { reload } from 'browser-sync';
import htmlReplace from 'gulp-html-replace';

import concatCss from 'gulp-concat-css';
import minifyCss from 'gulp-minify-css';

import gulpUtil from 'gulp-util';
import uuid from 'node-uuid';
import replace from 'gulp-just-replace';
import { argv } from 'yargs';

let baseUrl = '';

const paths = {
  bundle: 'app.js',
  srcPolyfill: require.resolve('babel-polyfill/dist/polyfill.min.js'),
  srcManifest: 'manifest.json',
  srcJsx: 'src/Index.js',
  srcCss: 'src/**/*.css',
  srcImg: 'src/images/**',
  srcFont: 'src/fonts/**',
  dist: 'dist',
  distJs: 'dist/js',
  distImg: 'dist/images',
  distFont: 'dist/fonts'
};

gulp.task('clean', cb => {
  rimraf('dist', cb);
});

gulp.task('browserSync', (done) => {
  browserSync({
    server: {
      baseDir: './'
    }
  });
  done();
});

gulp.task('watchify', () => {
  gulp.src(paths.srcPolyfill)
    .pipe(gulp.dest(paths.distJs));

  let bundler = watchify(browserify(paths.srcJsx, watchify.args));

  function rebundle() {
    return bundler
      .bundle()
      .on('error', notify.onError())
      .pipe(source(paths.bundle))
      .pipe(buffer())
      .pipe(replace([
        {
          search: /%BASE_URL%/g,
          replacement: baseUrl
        }
      ]))
      .pipe(gulp.dest(paths.distJs))
      .pipe(reload({stream: true}));
  }

  bundler.transform(babelify.configure({
    compact: false,
    minified: false,
    presets: [
      "es2015",
      "react"
    ],
    env: {
      production: {
        plugins: [
          [
            "direct-import",
            [
              {
                "name": "material-ui",
                "indexFile": "material-ui/index.es"
              },
              {
                "name": "material-ui/svg-icons",
                "indexFile": "material-ui/svg-icons/index.es"
              }
            ]
          ]
        ]
      }
    }
  }))
  .on('update', rebundle);
  return rebundle();
});

gulp.task('browserify', () => {
  return browserify(paths.srcJsx)
    .transform(babelify.configure({
      compact: false,
      minified: false,
      presets: [
        "es2015",
        "react"
      ],
      env: {
        production: {
          plugins: [
            [
              "direct-import",
              [
                {
                  "name": "material-ui",
                  "indexFile": "material-ui/index.es"
                },
                {
                  "name": "material-ui/svg-icons",
                  "indexFile": "material-ui/svg-icons/index.es"
                }
              ]
            ],
            "transform-react-constant-elements",
            "transform-react-inline-elements",
            "transform-react-remove-prop-types"
          ]
        }
      }
    }))
    .bundle()
    .pipe(source(paths.bundle))
    .pipe(buffer())
    .pipe(uglify().on('error', gulpUtil.log))
    .pipe(replace([
      {
        search: /%BASE_URL%/g,
        replacement: baseUrl
      }
      ]))
    .pipe(gulp.dest(paths.distJs));
});

gulp.task('styles', () => {
  return gulp.src(paths.srcCss)
  .pipe(concatCss("styles/main.css"))
  //.pipe(sourcemaps.init())
  .pipe(minifyCss({compatibility: 'ie9'}))
  //.pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(paths.dist))
  .pipe(reload({stream: true}));
});

gulp.task('htmlReplace', async () => {
  const buildUuid = uuid.v4();

  await gulp.src(paths.srcPolyfill)
    .pipe(gulp.dest(paths.distJs));
  await gulp.src(paths.srcManifest)
    .pipe(gulp.dest(paths.dist));

  await gulp.src('index.html')
  .pipe(htmlReplace({
    css: 'styles/main.css?v=' + buildUuid,
    js: [
      'js/polyfill.min.js?v=' + buildUuid,
      'js/app.js?v=' + buildUuid
    ]
  }))
  .pipe(gulp.dest(paths.dist));

  await gulp.src('index.appcache.html')
  .pipe(gulp.dest(paths.dist));

  await gulp.src('safetrack.html')
  .pipe(gulp.dest(paths.dist));

  await gulp.src('index.appcache')
    .pipe(replace([
      {
        search: /%BUILD_UUID%/g,
        replacement: buildUuid
      }
    ]))
    .pipe(gulp.dest(paths.dist));

  await gulp.src('sw.js')
  .pipe(replace([
    {
      search: /%BUILD_UUID%/g,
      replacement: buildUuid
    }
  ]))
  .pipe(gulp.dest(paths.dist));
});

gulp.task('images', () => {
  return gulp.src(paths.srcImg)
    // .pipe(imagemin({
    //   progressive: true,
    //   svgoPlugins: [{removeViewBox: false}],
    //   use: [pngquant()]
    // }))
    .pipe(gulp.dest(paths.distImg));
});

gulp.task('fonts', () => {
  return gulp.src(paths.srcFont)
  .pipe(gulp.dest(paths.distFont));
});

gulp.task('lint', () => {
  return gulp.src(paths.srcJsx)
  .pipe(eslint())
  .pipe(eslint.format());
});

gulp.task('watchTask', async () => {
  await gulp.watch(paths.srcCss, gulp.series('styles'));
  await gulp.watch(paths.srcJsx, gulp.series('lint'));
});

gulp.task('watch', gulp.series(done => {
  if (argv.prod) {
    baseUrl = '';
  } else if (argv.test) {
    baseUrl = 'https://localhost:9443';
  } else {
    baseUrl = 'https://dcmetrohero.com';
  }
  gulpUtil.log('baseUrl: \'' + baseUrl + '\'');
  done();
}, 'clean', 'browserSync', 'watchTask', 'watchify', 'styles',/* 'lint',*/ 'images', 'fonts'));

gulp.task('build', gulp.series(done => {
  process.env.NODE_ENV = 'production';
  if (argv.test) {
    baseUrl = 'https://localhost:9443';
  } else if (argv.dev) {
    baseUrl = 'https://dcmetrohero.com';
  } else {
    baseUrl = '';
  }
  gulpUtil.log('baseUrl: \'' + baseUrl + '\'');
  done();
}, 'clean', 'browserify', 'styles', 'htmlReplace', 'images', 'fonts'));
