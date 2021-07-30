<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Brilliant Community</title>

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

        <!-- Styles -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css" integrity="sha512-NhSC1YmyruXifcj/KFRWoC561YpHpc5Jtzgvbuzx5VozKpWvQ+4nXhPdFgmx8xqexRcpAglTj9sIBWINXa8x5w==" crossorigin="anonymous" referrerpolicy="no-referrer" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
        <link rel="stylesheet" href="/app.css" />

        <!-- Scripts -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
        <script src="https://unpkg.com/vue@next"></script>
        <script>
            var ProblemJson = @json($problem, JSON_PRETTY_PRINT);
            var UserJson = @json($user, JSON_PRETTY_PRINT);
        </script>
        <script type="module" src="/editproblem.js"></script>
    </head>
    <body class="antialiased">

        <!-- Header -->
        <header class="row hdr-main">
            <div class="col s12 container">
                <div class="col s4 push-s5 hdr-links">
                    <span class="hdr-link"><a href='#'>Today</a></span>
                    <span class="hdr-link"><a href='#'>Courses</a></span>
                    <span class="hdr-link"><a href='#'>Practice</a></span>
                </div>
                <div class="col s4 push-s6 hdr-btns">
                    <span class="hdr-btn login-btn"><a href='#'>Log In</a></span>
                    <span class="hdr-btn signup-btn"><a href='#'>Signup</a></span>
                </div>
            </div>
        </header>

        <!-- Content -->
        <div class="row ctnt-container">
        <div class="col s8 push-s2 ctnt-main prblm-container">
            <div class="ctnt-sections row">
                <div class="prblm-header">
                    <span class="prblm-title">Title</span>
                    <div class="prblm-topiclevel">
                        <span class="prblm-topic">Topic</span>
                        <span class="prblm-level">Level 1</span>
                    </div>
                </div>

<div id="app">

<form method="POST" action="/edit">
@csrf

<input type="text" name="id" v-bind:value="this.id" style="display: none;" />

<input type="text" name="title" value="{{ old('title') }}" />
@error('title')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror

<input type="text" name="category_id" v-bind:value="this.topic_id" />
@error('category_id')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror

<input type="text" name="level" v-bind:value="this.level" />
@error('level')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror

<input type="text" name="body" v-bind:value="this.question" />
@error('body')
    <div class="alert alert-danger">{{ $message }}</div>
@enderror

<button>submit</button>
</form>

@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif


<div id="editor"></div>
<div id="preview"></div>
</div>

<template>
  <editor-content :editor="editor" />
</template>


            </div>
        </div>
        </div>
    </body>
</html>
