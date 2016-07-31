module.exports = function(grunt) {
    'use strict';

    // 配置Grunt各种模块的参数
    grunt.initConfig({
	less: {
	    kolocal: {
		options: {
		    compress:true,
		    cleancss:true,
		    ieCompat:true,
		    sourceMap:true,
		    outputSourceFiles: true,
		    sourceMapFilename: 'css/kolocal.css.map',
		},
		files: {
		    "css/kolocal.css": "css/less/kolocal.less"
		}
	    },
	},

	// 以下为js项, 用jshint后，问题太多，暂时不启用
	jshint: {
	    all: [
		'js/src/exchange.js',
		'js/src/kolocal.js',
		'js/src/controller.js',
		'js/src/base.js',
		'js/src/printer.js',

		'js/src/offline_main.js',
		'js/src/offline_controller.js',
		'js/src/offline_base.js',
		'js/src/offline_dashboard.js',
		'js/src/offline_chinese.js',
		'js/src/offline_order_today.js',
		'js/src/offline_product.js',
	    ],
	    options: {
                asi: true,
		globals:{
		    kolocal:true,
		    offline:true,
		    angular:true,
		    alert:true, 
		    console:true, 
		    window:true, 
		    document:true,
		},
		undef:true,
		// unused:true,  // Todo:待项目完成个差不多再来清除未用变量
	    }
	},

	concat: { 
	    js1: {
		nonull: true,
		src: [
		    'js/src/kolocal.js',
		    'js/src/controller.js',
		    'js/src/base.js',
		    'js/src/printer.js',
		],
		dest: 'js/kolocal.all.js',
	    },
	    js2: {
		nonull: true,
		src: [
		    'js/src/offline_main.js',
		    'js/src/offline_controller.js',
		    'js/src/offline_base.js',
		    'js/src/offline_dashboard.js',
		    'js/src/offline_chinese.js',
		    'js/src/offline_order_today.js',
		    'js/src/offline_product.js',
		],
		dest: 'js/offline.all.js',
	    }

	},

	ngAnnotate: {
            options: {
		remove:true,
		singleQuotes: true,
		// Task-specific options go here.
            },
	    kolocal:{
		files: {
		    'js/kolocal.annotate.all.js': ['js/kolocal.all.js'],
		}
	    },
	    offline:{
		files: {
		    'js/offline.annotate.all.js': ['js/offline.all.js'],
		}
	    },
	    exchange:{
		files: {
		    'js/exchange.annotate.js': ['js/src/exchange.js'],
		}
	    },

	},

    	uglify: {
	    kolocal:{
    		options: {
    		    // beautify: true,
		    compress:true,
    		    sourceMap:true,
    		    sourceMapName: 'js/kolocal.min.js.map',
    		},
		files: {
		    'js/kolocal.min.js': ['js/kolocal.annotate.all.js']
		}
	    },
	    offline:{
    		options: {
    		    // beautify: true,
		    compress:true,
    		    sourceMap:true,
    		    sourceMapName: 'js/offline.min.js.map',
    		},
		files: {
		    'js/offline.min.js': ['js/offline.annotate.all.js']
		}
	    },
	    exchange:{
    		options: {
    		    // beautify: true,
		    compress:true,
    		    sourceMap:true,
    		    sourceMapName: 'js/exchange.min.js.map',
    		},
		files: {
		    'js/exchange.min.js': ['js/exchange.annotate.js']
		}
	    },

    	},
   
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['less', 'jshint', 'concat', 'ngAnnotate', 'uglify']);
    grunt.registerTask('temp', ['less', 'jshint', 'concat', 'ngAnnotate']);
};
