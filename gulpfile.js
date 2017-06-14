var gulp = require('gulp');
var ts = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');

gulp.task('build', function () {
    var tsResult = tsProject.src().pipe(tsProject());
    tsResult.dts.pipe(gulp.dest('./dts'));
    return tsResult.js.pipe(gulp.dest('./js'));
});