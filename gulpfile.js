const gulp = require('gulp');
const del = require('del');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const gcmq = require('gulp-group-css-media-queries');
const less = require('gulp-less');
const browserSync = require('browser-sync').create();
const smartGrid = require('smart-grid');
const path = require('path');

let isMinify = process.argv.includes('--clean');
let isSync = process.argv.includes('--sync');

function clean(){
	return del('./build/*');
}

function html(){
	return gulp.src('./src/**/*.html')
				.pipe(gulp.dest('./build'))
				.pipe(gulpIf(isSync, browserSync.stream()));
}

function styles(){
	return gulp.src('./src/css/styles.less')
				.pipe(less())
				.pipe(gcmq())
				.pipe(autoprefixer())
				.pipe(gulpIf(isMinify, cleanCSS({
					level: 2
				})))
				.pipe(gulp.dest('./build/css'))
				.pipe(gulpIf(isSync, browserSync.stream()));
}

function cssOnly(){
	return gulp.src('./src/**/*.css')
				.pipe(gcmq())
				.pipe(autoprefixer())
				.pipe(gulpIf(isMinify, cleanCSS({
					level: 2
				})))
				.pipe(gulp.dest('./build'))
				.pipe(gulpIf(isSync, browserSync.stream()));
}

function images(){
	return gulp.src('./src/img/**/*')
				.pipe(gulp.dest('./build/img'));
}


function js(){
	return gulp.src('./src/js/*.js')
				.pipe(gulp.dest('./build/js'))
				.pipe(gulpIf(isSync, browserSync.stream()));
}

function watch(){
	if(isSync){
		browserSync.init({
			server: {
				baseDir: "./build/"
			}
		});
	}

	gulp.watch('./src/css/**/*.less', styles);
	gulp.watch('./src/css/**/*.css', cssOnly);
	gulp.watch('./src/**/*.html', html);
	gulp.watch('./smartgrid.js', grid);
	gulp.watch('./src/js/*.js', js);
}

function grid(done){
	delete require.cache[path.resolve('./smartgrid.js')];
	let options = require('./smartgrid.js');
	smartGrid('./src/css', options);
	done();
}

let build = gulp.parallel(html, styles, cssOnly, images, js);
let buildWithClean = gulp.series(clean, build);
let dev = gulp.series(buildWithClean, watch);

gulp.task('watch', dev);
gulp.task('grid', grid);