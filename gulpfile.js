const sass = require('gulp-sass')(require('sass'));
const gulp = require('gulp');
const del = require('del')
const htmlmin = require('gulp-htmlmin')
const rename = require('gulp-rename')
const minify = require('gulp-minify')
const autoprefixer = require('gulp-autoprefixer')
const concat = require('gulp-concat')
const cleanCss = require('gulp-clean-css')
const fileinclude = require('gulp-file-include')
const imagemin = require('gulp-imagemin')
const svgo = require('gulp-svgo')
const gulpif = require('gulp-if')
const browserSync = require('browser-sync').create()
const groupmedia = require('gulp-group-css-media-queries');



const path = {
	html: {
		src: 'src/*.html',
		dest: 'dist/',
		watch: 'src/**/*.html'
	},
	style: {
		src: 'src/style/**/*.{scss, css, less, sass}',
		dest: 'dist/css/',
	},
	img: {
		src: 'src/img/**/*.{jpg,svg,ico,png,webp,jpeg,tiff,psd,bmp,gif}',
		dest: 'dist/img/'
	},
	js: {
		src: 'src/script/**/*.{js, ts}',
		dest: 'dist/js/'
	},
}

function clean() {
	return del('dist')
}


function css() {
	return gulp.src(path.style.src)
		.pipe(concat('style.css'))
		.pipe(sass())
		.pipe(
			gulpif(
				isBuild,
				autoprefixer({
					overrideBrowserslist: ['last 3 versions'],
					cascade: false
				}))
		)
		.pipe(
			gulpif(
				isBuild,
				groupmedia()
			)
		)
		.pipe(
			gulpif(
				isBuild,
				gulp.dest(path.style.dest)
			)
		)
		.pipe(
			gulpif(
				isBuild,
				cleanCss()
			)
		)
		.pipe(
			gulpif(
				isBuild,
				rename('style.min.css')
			)
		)
		.pipe(gulp.dest(path.style.dest))
		.pipe(browserSync.stream())
}

function html() {
	return gulp.src(path.html.src)
		.pipe(fileinclude())
		.pipe(
			gulpif(
				isBuild,
				gulp.dest(path.html.dest)
			)
		)
		.pipe(
			gulpif(
				isBuild,
				htmlmin({ collapseWhitespace: true })
			)
		)
		.pipe(
			gulpif(
				isBuild,
				rename({
					suffix: '.min'
				}))
		)
		.pipe(gulp.dest(path.html.dest))
		.pipe(browserSync.stream())
}

function js() {
	return gulp.src(path.js.src)
		.pipe(
			gulpif(
				isBuild,
				gulp.dest(path.js.dest)
			)
		)
		.pipe(
			gulpif(
				isBuild,
				minify()
			)
		)
		.pipe(gulp.dest(path.js.dest))
		.pipe(browserSync.stream())
}

function img() {
	return gulp.src(path.img.src)
		.pipe(
			gulpif(
				isBuild,
				imagemin([
					imagemin.gifsicle({ interlaced: true }),
					imagemin.mozjpeg({ quality: 75, progressive: true }),
					imagemin.optipng({ optimizationLevel: 5 })
				])
			)
		)
		.pipe(
			gulpif(
				isBuild,
				svgo()
			)
		)
		.pipe(gulp.dest(path.img.dest))
		.pipe(browserSync.stream())
}

function watch() {
	browserSync.init({
		server: {
			baseDir: './dist/'
		}
	})
	gulp.watch(path.style.src, css)
	gulp.watch(path.html.watch, html).on('change', browserSync.reload)
	gulp.watch(path.js.src, js)
	gulp.watch(path.img.src, img)
}

exports.clean = clean
exports.css = css
exports.html = html
exports.watch = watch

const isBuild = process.argv.includes("--build")
const isDev = !process.argv.includes("--build")

exports.default = gulp.series(clean, gulp.parallel(css, html, js, img), watch)
exports.build = gulp.series(clean, gulp.parallel(css, html, js))