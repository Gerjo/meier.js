#!/usr/bin/php
<?php

refactor(".");

function refactor($dir) {
    foreach(scandir($dir) as $file) {
        if(is_dir($dir . DIRECTORY_SEPARATOR . $file)) {        
		if($file[0] != '.') {
			refactor($dir . DIRECTORY_SEPARATOR . $file);
			print "Dir: " . $file . PHP_EOL;
		}
        } else if(substr($file, -3) == ".js") {
		$source = file_get_contents($dir . DIRECTORY_SEPARATOR . $file);
		
		$source = str_replace("meier/aux/", "meier/extra/", $source);

		file_put_contents($dir . DIRECTORY_SEPARATOR . $file, $source);

		print "File: " . $file . PHP_EOL;
	}

    }
}

?>
