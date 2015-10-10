var gulp = require('gulp');
var cucumber = require('gulp-cucumber');
var jshint = require('gulp-jshint');

gulp.task('test', function() {
	var options = {
		'steps': 'test/features/step_definitions/*.js',
		'format': 'pretty'
	};

    return gulp.src('test/features/*')
			.pipe(cucumber(options));
});

gulp.task('jshint', function() {
	var bitterappleJs = 'bitter-apple/*.js';
	var bitterappleTestJs = 'test/features/step_definitions/*.js';

	return gulp.src([ bitterappleJs, bitterappleTestJs ])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});
