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
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug');
            $table->unsignedBigInteger('cat_id');
            $table->string('tags')->nullable();
            // $table->unsignedBigInteger('tag_id')->nullable();
            $table->text('description')->nullable();
            $table->string('author');
            $table->text('meta_title');
            $table->text('meta_keywords');
            $table->text('meta_description');
            $table->enum('status',['Publish','Draft'])->default('Publish');
            $table->string('image')->nullable();
            $table->timestamp('publish_date');
            
            //Relationship

            $table->foreign('cat_id')->references('id')->on('categories')->onDelete('cascade');

            // $table->foreign('tag_id')->references('id')->on('tags')->onDelete('cascade');

            // $table->foreignId('tag_id')->references('id')->on('tags')->onDelete('cascade');

            // $table->foreignId('tag_id')->constrained('tags')->cascadeOnDelete();

            // $table->unsignedBigInteger('user_id')->unique();

            // $table->foreign('tag_id')->references('id')->on('tags')
            //  ->restrictOnDelete()
            //  ->cascadeOnUpdate();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
