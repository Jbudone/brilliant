<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('problems_of_the_weeks', function (Blueprint $table) {
            $table->id();

            $table->string('week')->index();
            $table->smallInteger('level')->default(0);
            $table->unique(['week', 'level']);
            $table->smallInteger('count')->default(0);
            $table->timestamps();
        });

        Schema::table('problems', function (Blueprint $table) {
            $table->unsignedBigInteger('problemsoftheweek_id')->nullable();
            $table->foreign('problemsoftheweek_id')->references('id')->on('problems_of_the_weeks')->onUpdate('cascade')->onDelete('cascade');
        });

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('problems', function (Blueprint $table) {
            $table->dropForeign(['problemsoftheweek_id']);
            $table->dropColumn('problemsoftheweek_id');
        });

        Schema::dropIfExists('problems_of_the_weeks');
    }
};
