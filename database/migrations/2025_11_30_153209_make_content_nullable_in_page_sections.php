<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('page_sections', function (Blueprint $table) {
            $table->text('content')->nullable()->change();
            $table->string('media', 255)->nullable()->change();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('page_sections', function (Blueprint $table) {
            //
        });
    }
};
