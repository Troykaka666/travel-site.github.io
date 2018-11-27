var gulp = require("gulp"),
  watch = require("gulp-watch"),
  // postcss = require("gulp-postcss"),
  // autoprefixer = require("autoprefixer"),
  // cssvars = require("postcss-simple-vars"),
  // nested = require("postcss-nested"),
  // cssImport = require("postcss-import"),
  // Import scss
  webpack = require("webpack"),
  browserSync = require("browser-sync").create();
//open the browser for the webpage preview
(prefix = require("gulp-autoprefixer")),
  (sass = require("gulp-sass")),
  (sourcemaps = require("gulp-sourcemaps")),
  (cssmin = require("gulp-cssnano")),
  (rename = require("gulp-rename")),
  (svgSprite = require("gulp-svg-sprite")),
  (rename = require("gulp-rename"));

var prefixerOptions = {
  browsers: ["last 2 versions"]
};

//config to set up a path to save the created svg file
var config = {
  mode: {
    css: {
      render: {
        css: {
          template: "./app/temp/sprite.css"
        }
      }
    }
  }
};

//to combine all icon into one svg image
gulp.task("createSprite", function() {
  return gulp
    .src("app/assets/images/icons/**/*.svg")
    .pipe(svgSprite(config))
    .pipe(gulp.dest("app/temp/sprite/"));
});

gulp.task("style", function() {
  return gulp
    .src("./app/assets/style/styles.scss")
    .pipe(sourcemaps.init())
    .pipe(
      sass({ includePaths: require("node-normalize-scss").includePaths }).on(
        "error",
        sass.logError
      )
    )
    .pipe(prefix(prefixerOptions))
    .on("error", function(errorInfo) {
      console.log(errorInfo.toString());
      this.emit("end");
    })
    .pipe(rename("styles.css"))
    .pipe(gulp.dest("./app/temp/"))
    .pipe(cssmin())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./app/temp/"));
});

gulp.task("watch", function() {
  browserSync.init({
    notify: false,
    server: {
      baseDir: "app"
    }
  });

  watch(".add/app/index.html", function() {
    browserSync.reload();
  });

  watch("./app/assets/styles/**/*.css", function() {
    gulp.setMaxListeners("cssInject");
  });

  watch("./app/assets/scripts/**/*.js", function() {
    gulp.start("scriptsRefresh");
  });

  gulp.watch("./app/assets/**/*.scss", ["style"]);
});

//new gulp task to run webpack automatically
gulp.task("scripts", function(callback) {
  webpack(require("./webpack.config.js"), function(err, stats) {
    if (err) {
      console.log(err.toString());
    }
    console.log(stats.toString());
    callback();
  });
});

//only will excute after the task in [] is completed
gulp.task("cssInject", ["styles"], function() {
  return gulp.src("./app/temp/styles.css").pipe(browserSync.stream());
});

gulp.task("scriptsRefresh", ["scripts"], function() {
  browserSync.reload();
});
