<?php

namespace App\Helpers;

use Illuminate\Support\Str;


class FileUpload
{


   // public static function upload(
   //    string $path,
   //    string $name,
   //    string $type = "",
   //    string $size = "",
   //    string $error = "",
   //    string $tmp_name = "",
   //    string $extension = ""
   // ) {

   //    $file = [
   //       "path" => $path,
   //       "name" => $name,
   //       "type" => $type,
   //       "size" => $size,
   //       "error" => $error,
   //       "tmp_name" => $tmp_name,
   //       "extension" => $extension,
   //    ];

   //    return $file;
   // }

   # Image Upload 
   // public static function ImageUpload(){}

   // public static function ImageDelete(){}

   // public static function uploadImage($file, $path = 'uploads', $oldFile = null)
   // {
   //    if (!$file) {
   //       return $oldFile; // যদি নতুন ফাইল না দেওয়া হয়, তাহলে পুরাতন ফাইলই রাখবে
   //    }

   //    // পুরানো ফাইল মুছে ফেলা
   //    if ($oldFile && file_exists(public_path($oldFile))) {
   //       unlink(public_path($oldFile));
   //    }

   //    // নতুন ফাইলের নাম বানানো
   //    $filename = Str::random(20) . '.' . $file->getClientOriginalExtension();

   //    // ফাইল move করা
   //    $file->move(public_path($path), $filename);

   //    return $path . '/' . $filename; // ডাটাবেজে এই path save করো
   // }


   public static function uploadImage($file, $folder)
   {

      $filename = time() . '.' . $file->getClientOriginalExtension();
     // $file->move(public_path('uploads/' . $folder), $filename);
      $url = $file->move('uploads/blog/', $filename);
      // return $url;
      return "uploads/$folder/" . $filename;
   }

}
