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
        <script type="module" src="/addproblem.js"></script>
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

<form method="POST" action="/addproblem">
@csrf

<input type="text" name="title" value="TITLE" />
<input type="text" name="category_id" value="1" />
<input type="text" name="level" value="1" />
<input type="text" name="body" value="PROBLEM BODY" />

<button>submit</button>
</form>


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
