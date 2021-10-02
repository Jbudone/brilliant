<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    use HasFactory;

    protected $primaryKey = null;
    public $incrementing = false;
    public $timestamps = false;
    protected $fillable = ['user_id', 'problem_id', 'comment_id', 'upvote'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function problem()
    {
        return $this->belongsTo(Problem::class, 'problem_id', 'id');
    }

    public function comment()
    {
        return $this->belongsTo(Comment::class, 'comment_id', 'id');
    }
}
