<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = ['body', 'problem_id', 'author_id', 'parent_comment_id'];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id', 'id');
    }

    public function problem()
    {
        return $this->belongsTo(Problem::class, 'problem_id', 'id');
    }

    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_comment_id', 'id');
    }

    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_comment_id', 'id');
    }
}
