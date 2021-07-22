<!DOCTYPE html>
<html lang="en-us">
<head>
    <meta http-equiv="Cache-Control" content="must-revalidate" />
    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <meta http-equiv="Content-Language" content="en_US" />
    <title>
            Brilliant Community
    </title>

    <link rel="stylesheet" href="brilliant.desktop.css">
    <link rel="stylesheet" href="feed_page.css">
    <link rel="stylesheet" href="styles.css">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="initialProblems.js"></script>
    <script src="script.js?v=<?php echo time(); ?>"></script>
</head>
<body class="use_katex enable-remind-share-buttons portal-page fonts hdr-big js not-msedge webkit chrome no-touch">

<div class="portal-feed-container portal-card col col-8" data-controller="app/newsfeed:portalFeedSwitcher" data-controller-inited="true">
    <div class="card clearfix">
        <div class="btn-group row" id="switcher-btns">
            <button class="btn active" data-target="#portal-problems">Problems</button>
            <button class="btn" data-target="#portal-solutions">Needs solution</button>
            <button class="btn" data-target="#portal-discussions">Discussions</button>
        </div>

        <div id="cmp_community_portal_problems_id">

            <div class="row feed-section problems-section active" data-controller="app/newsfeed:portalFeed" id="portal-problems" data-url-format="/community/home/problems/<%- feed_type %>/<%- difficulty %>/<%- topic_slug %>/" data-controller-inited="true">

                <div class="feed-section-row feed-section-header row">
                    <span class="td">Title</span>
                    
                    <span class="td dropdown">
                        <button class="dropdown-toggle" data-toggle="dropdown"> Topic <span class="arrow"></span> </button>
                        <ul class="dropdown-menu">
                            <li><strong class="active">All</strong></li>
                            <li> <button data-choice="algebra" data-field="#community_portal_problems_form #id_topic_slug" class="btn-link feed-section-choice"> Algebra </button> </li>
                            <li> <button data-choice="geometry" data-field="#community_portal_problems_form #id_topic_slug" class="btn-link feed-section-choice"> Geometry </button> </li>
                            <li> <button data-choice="number-theory" data-field="#community_portal_problems_form #id_topic_slug" class="btn-link feed-section-choice"> Number Theory </button> </li>
                            <li> <button data-choice="calculus" data-field="#community_portal_problems_form #id_topic_slug" class="btn-link feed-section-choice"> Calculus </button> </li>
                            <li> <button data-choice="discrete-mathematics" data-field="#community_portal_problems_form #id_topic_slug" class="btn-link feed-section-choice"> Probability </button> </li>
                            <li> <button data-choice="logic" data-field="#community_portal_problems_form #id_topic_slug" class="btn-link feed-section-choice"> Logic </button> </li>
                            <li> <button data-choice="mechanics" data-field="#community_portal_problems_form #id_topic_slug" class="btn-link feed-section-choice"> Classical Mechanics </button> </li>
                            <li> <button data-choice="electricity-and-magnetism" data-field="#community_portal_problems_form #id_topic_slug" class="btn-link feed-section-choice"> Electricity and Magnetism </button> </li>
                            <li> <button data-choice="computer-science" data-field="#community_portal_problems_form #id_topic_slug" class="btn-link feed-section-choice"> Computer Science </button> </li>
                            <li> <button data-choice="quantitative-finance" data-field="#community_portal_problems_form #id_topic_slug" class="btn-link feed-section-choice"> Quantitative Finance </button> </li>
                            <li> <button data-choice="chemistry" data-field="#community_portal_problems_form #id_topic_slug" class="btn-link feed-section-choice"> Chemistry </button> </li>
                        </ul>
                    </span>
                
                    <span class="td dropdown">
                        <button class="dropdown-toggle" data-toggle="dropdown"> Popularity <span class="arrow"></span> </button>
                        <ul class="dropdown-menu">
                            <li> <button data-choice="new" data-field="#community_portal_problems_form #id_feed_type" class="btn-link feed-section-choice"> New </button> </li>
                            <li><strong class="active">Popular</strong></li>
                            <li> <button data-choice="following" data-field="#community_portal_problems_form #id_feed_type" class="btn-link feed-section-choice"> Following </button> </li>
                        </ul>
                    </span>
                
                    <span class="td dropdown">
                        <button class="dropdown-toggle" data-toggle="dropdown"> Difficulty <span class="arrow"></span> </button>
                        <ul class="dropdown-menu">
                            <li><strong class="active">All</strong></li>
                            <li> <button data-choice="easy" data-field="#community_portal_problems_form #id_difficulty" class="btn-link feed-section-choice"> Easy </button> </li>
                            <li> <button data-choice="medium" data-field="#community_portal_problems_form #id_difficulty" class="btn-link feed-section-choice"> Medium </button> </li>
                            <li> <button data-choice="hard" data-field="#community_portal_problems_form #id_difficulty" class="btn-link feed-section-choice"> Hard </button> </li>
                        </ul>
                    </span>
                </div>


                <div id="newsfeed-page" data-controller="app/newsfeed:feed" data-controller-inited="true">
                    <div id="community_featured_wrapper" class="feed nf-feed-wrapper inited">
                        <div class="nf-feed-items">
                            <div class="cmp_7e1fbd435d5551f5ea7c7cb1e0859240_id">
                                <div data-controller="app/newsfeed:problemsFeedPreviews" data-controller-inited="true" id="problemsList">
                            
                                </div>
                            </div>
                        </div>
                    </div>
        
                    <footer>

                        <ul class='pagination'>
                            <li class='paginate_button page-item previous disabled' id='paginate_previous'>
                                <a href='#' class='page-link'>Previous</a>
                            </li>
                            <li class='paginate_button page-item disabled' id='paginate_ellipses'>
                                <a class='page-ellipses'>...</a>
                            </li>
                            <li class='paginate_button page-item next' id='paginate_next'>
                                <a href='#' class='page-link'>Next</a>
                            </li>
                        </ul>
                    </footer>
                </div>

            </div>
        </div>
    </div>
</div>
</body>
</html>
