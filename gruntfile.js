'use strict';

module.exports = function(grunt) {
	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	    jsdoc : {
	        dist : {
	            src: ['lib/*.js'], 
	            options: {
	                destination: 'documentation',
	                template: 'node_modules/jaguarjs-jsdoc'
	            }
	        }
	    }
	});

	grunt.loadNpmTasks('grunt-jsdoc');


	//Default task(s).
	grunt.registerTask('default', ['jsdoc']);
};
