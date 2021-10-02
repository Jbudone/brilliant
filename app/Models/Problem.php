<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Problem extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'category_id', 'level', 'body', 'author_id', 'solution', 'source', 'discussion', 'archive_id', 'votes', 'points'];

    public function topic()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id', 'id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function solves()
    {
        return $this->hasMany(Solves::class);
    }
}
