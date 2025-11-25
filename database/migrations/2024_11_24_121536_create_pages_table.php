<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('pageName');
            $table->string('slug');
            $table->string('pageUrl');
            $table->text('pageDescription');
            $table->string('metaTitle');
            $table->string('metaKeywords');
            $table->text('metaDescription');
            $table->text('headerScript')->nullable();
            $table->text('footerScript')->nullable();
            $table->enum('pageStatus', ['publish', 'unpublish'])->default('publish');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
