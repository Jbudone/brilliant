<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class Initial extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');

            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();

            $table->string('password');

            $table->string('archive_id')->nullable();
            $table->index('archive_id');
            $table->boolean('status')->default(1);

            $table->string('role')->nullable();

            $table->unsignedBigInteger('badges')->default(0); // bitfield of badges
            $table->smallInteger('stars')->default(0);
            $table->smallInteger('coins')->default(0);
            $table->smallInteger('points')->default(0);
            $table->smallInteger('stars_awarded')->default(0);

            $table->smallInteger('age')->nullable();
            $table->string('location')->nullable();
            $table->string('avatar')->nullable();
            $table->string('blurb')->default("");

            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_resets', function (Blueprint $table) {
            $table->string('email')->index();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });

        // =========================================================== //

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('problems', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('category_id')->nullable();
            $table->foreign('category_id')->references('id')->on('categories')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('author_id');
            $table->foreign('author_id')->references('id')->on('users')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('archive_id')->nullable()->unique();
            $table->index('archive_id');

            $table->boolean('discussion');
            $table->index('discussion');

            $table->string('title', 256); // FIXME: 128 for problems were okay, discussions needed 256 eg. although-i-am-almost-illiterate-mathematically-i

            $table->mediumText('body'); // prefix metadata for solution/etc.  (since this could be problem or discussion)
            $table->smallInteger('level')->nullable();
            $table->text('solution')->nullable(); // index for multiple choice, text for input answer
            $table->text('source')->nullable(); // link to source file
            $table->text('archive_meta')->nullable();
            $table->boolean('hidden')->default(false);

            $table->smallInteger('votes')->default(0);  // == upvotes + downvotes
            $table->smallInteger('points')->default(0); // == upvotes - downvotes
            $table->smallInteger('coins')->default(0);
            $table->smallInteger('stars')->default(0);

            $table->timestamps();
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('author_id');
            $table->foreign('author_id')->references('id')->on('users')->onUpdate('cascade')->onDelete('cascade');

            $table->mediumText('body');

            $table->unsignedBigInteger('problem_id');
            $table->foreign('problem_id')->references('id')->on('problems')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('parent_comment_id')->nullable();
            $table->foreign('parent_comment_id')->references('id')->on('comments')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('archive_id')->nullable();
            $table->index('archive_id');

            $table->boolean('hidden')->default(false);

            $table->smallInteger('votes')->default(0);  // == upvotes + downvotes
            $table->smallInteger('points')->default(0); // == upvotes - downvotes
            $table->smallInteger('coins')->default(0);

            $table->timestamps();
        });

        Schema::create('solves', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('problem_id');
            $table->foreign('problem_id')->references('id')->on('problems')->onUpdate('cascade')->onDelete('cascade');

            $table->text('solution')->nullable(); // metadata JSON of solution; null indicates user gave up
            $table->boolean('correct');

            $table->timestamps();
        });


        // =========================================================== //

        Schema::create('votes', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('problem_id');
            $table->foreign('problem_id')->references('id')->on('problems')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('comment_id')->nullable();
            $table->foreign('comment_id')->references('id')->on('comments')->onUpdate('cascade')->onDelete('cascade');

            $table->boolean('upvote');
        });

        Schema::create('admin_events', function (Blueprint $table) {

            $table->unsignedBigInteger('issue_id');
            $table->index('issue_id');

            $table->text('event'); // metadata JSON
            $table->timestamps();
        });

        Schema::create('stars', function (Blueprint $table) {

            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('problem_id');
            $table->foreign('problem_id')->references('id')->on('problems')->onUpdate('cascade')->onDelete('cascade');
        });

        Schema::create('coins', function (Blueprint $table) {

            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('problem_id');
            $table->foreign('problem_id')->references('id')->on('problems')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('comment_id')->nullable();
            $table->foreign('comment_id')->references('id')->on('comments')->onUpdate('cascade')->onDelete('cascade');

            $table->smallInteger('coin');
        });

        Schema::create('reports', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('problem_id');
            $table->foreign('problem_id')->references('id')->on('problems')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('comment_id')->nullable();
            $table->foreign('comment_id')->references('id')->on('comments')->onUpdate('cascade')->onDelete('cascade');

            $table->string('reason');
            $table->timestamps();
        });

        Schema::create('activity', function (Blueprint $table) {

            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('problem_id')->nullable();
            $table->foreign('problem_id')->references('id')->on('problems')->onUpdate('cascade')->onDelete('cascade');

            $table->unsignedBigInteger('comment_id')->nullable();
            $table->foreign('comment_id')->references('id')->on('comments')->onUpdate('cascade')->onDelete('cascade');

            $table->string('event');
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
        //
        Schema::dropIfExists('activity');
        Schema::dropIfExists('admin_events');
        Schema::dropIfExists('reports');
        Schema::dropIfExists('votes');
        Schema::dropIfExists('stars');
        Schema::dropIfExists('coins');

        Schema::dropIfExists('solves');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('problems');
        Schema::dropIfExists('categories');

        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('password_resets');
        Schema::dropIfExists('users');
    }
}
