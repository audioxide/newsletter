<header>
    <span class="header-text">Receive Audioxide roundups every month → <a href="#" class="signup-link">Sign up here</a></span>
        <div class="dropdown">
            <button class="dropbtn">Browse Archive
                <i class="fa fa-caret-down"></i>
            </button>
            <div class="dropdown-content">
                <a href="#">July 02021</a>
                <a href="#">June 02021</a>
                <a href="#">May 02021</a>
            </div>
        </div>

</header>

<style>

    /* Navbar container */
    header {
        overflow: hidden;
        background-color: #282828;
        font-family: Arial, sans-serif;
    }

    /* Links inside the navbar */
    header a {
        font-size: 16px;
        color: white;
        text-align: center;
        padding: 14px 16px;
        text-decoration: none;
    }

    .header-text {
        float: left;
        display: block;
        color: white;
        padding: 14px 16px;
    }

    .signup-link {
        text-decoration: underline;
    }

    /* The dropdown container */
    .dropdown {
        float: right;
        overflow: hidden;
    }

    /* Dropdown button */
    .dropdown .dropbtn {
        font-size: 16px;
        border: none;
        outline: none;
        color: white;
        padding: 14px 16px;
        background-color: inherit;
        font-family: inherit; /* Important for vertical align on mobile phones */
        margin: 0; /* Important for vertical align on mobile phones */
    }

    /* Add a red background color to navbar links on hover */
    .navbar a:hover, .dropdown:hover .dropbtn {
        background-color: lightgray;
    }

    /* Dropdown content (hidden by default) */
    .dropdown-content {
        display: none;
        position: absolute;
        background-color: #f9f9f9;
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
        z-index: 1;
    }

    /* Links inside the dropdown */
    .dropdown-content a {
        float: none;
        color: black;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
        text-align: left;
    }

    /* Add a grey background color to dropdown links on hover */
    .dropdown-content a:hover {
        background-color: #ddd;
    }

    /* Show the dropdown menu on hover */
    .dropdown:hover .dropdown-content {
        display: block;
    }

</style>