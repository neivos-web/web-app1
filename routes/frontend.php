<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\frontend\FrontendController;



#  ============= Frontend Route =============

// Route::get('/', [FrontendController::class, 'index'])->name('website');

Route::group(['prefix' => 'website'], function () {

   Route::get('/', [FrontendController::class, 'index'])->name('website.home');

   Route::get('/about-us', [FrontendController::class, 'about'])->name('website.about-us');

   //Blog 
   Route::get('/blog', [FrontendController::class, 'blog'])->name('website.blog');
   Route::get('/blog/details/{blog:slug}', [FrontendController::class, 'blogDetails'])->name('website.blog.details');


   Route::get('/gallery', [FrontendController::class, 'gallery'])->name('website.gallery');

   //service
   Route::get('/service', [FrontendController::class, 'service'])->name('website.service');
   Route::get('/service/details/{service:slug}', [FrontendController::class, 'ServiceDetails'])->name('website.service.details');


   // Route::post('/send-message', [FrontendController::class, 'SendMessage'])->name('website.send-message');

   Route::get('/privacy-policy', [FrontendController::class, 'PrivacyPolicy'])->name('website.privacy-policy');

   Route::get('/terms-and-conditions', [FrontendController::class, 'TermsCondition'])->name('website.terms-and-conditions');

   Route::get('/contact-us', [FrontendController::class, 'contact'])->name('website.contact-us');

   //frontend contact page send mail to admin
   Route::post('/mail-send', [FrontendController::class, 'MailSend'])->name('mail.send');
});

#  ============= Frontend Route =============