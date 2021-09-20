<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProblemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('problems', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('category_id')->nullable();
            $table->foreign('category_id')->references('id')->on('categories');

            $table->unsignedBigInteger('author_id');
            $table->foreign('author_id')->references('id')->on('users');

            $table->unsignedBigInteger('archive_id')->nullable();
            $table->index('archive_id');

            $table->boolean('discussion');
            $table->index('discussion');

            $table->string('title', 256); // FIXME: 128 for problems were okay, discussions needed 256 eg. although-i-am-almost-illiterate-mathematically-i

            $table->mediumText('body'); // prefix metadata for solution/etc.  (since this could be problem or discussion)
            $table->smallInteger('level')->nullable();
            $table->text('solution')->nullable(); // index for multiple choice, text for input answer
            $table->text('source')->nullable(); // link to source file
            $table->text('archive_meta')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('problems');
    }
}
