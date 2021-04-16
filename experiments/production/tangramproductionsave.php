<?php
// the $_POST[] array will contain the passed in filename and data
// the directory "kidproduction" is writable by the server (chmod 777)
$filename = "kidproduction/".$_POST['filename'];
$data = $_POST['filedata'];
// write the file to disk
file_put_contents($filename, $data);
?>