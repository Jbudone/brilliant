<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Typesense\LaravelTypesense\Interfaces\TypesenseDocument;
use Laravel\Scout\Searchable;
use Carbon\Carbon;

class Problem extends Model implements TypesenseDocument
{
    use HasFactory, Searchable;

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

    public function searchableAs()
    {
        return 'title';
    }

    public function toSearchableArray()
    {
        return [
            'id' => (string)$this->id,
            'created_at' => (integer)Carbon::parse($this->created_at)->timestamp,
            'name' => $this->title,
            'category' => (int)$this->category_id,
            'level' => (int)$this->level,
            'discussion' => (bool)$this->discussion,
            'body' => $this->body
        ];
    }

    public function getCollectionSchema(): array {
        return [
            'name' => $this->searchableAs(),
            'fields' => [
                [
                    'name' => 'name',
                    'type' => 'string',
                ],
                [
                    'name' => 'created_at',
                    'type' => 'int32',
                ],
                [
                    'name' => 'category',
                    'type' => 'int32',
                    'facet' => true
                ],
                [
                    'name' => 'level',
                    'type' => 'int32',
                    'facet' => true
                ],
                [
                    'name' => 'discussion',
                    'type' => 'bool',
                    'facet' => true
                ],
            ],
            'default_sorting_field' => 'created_at',
        ];
    }

    public function typesenseQueryBy(): array {
        return [
            'name',
        ];
    }
}
