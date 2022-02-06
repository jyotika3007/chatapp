/*
--------------------------------------------------------------
  Template Name: Gappa - Chat & Discussion Plateform Template
  File: Core JS File
--------------------------------------------------------------
 */
"use strict";
$(document).ready(function() {
    /* -- Show User Info -- */
    $("#view-user-info").on("click", function(e) {
        e.preventDefault();
        $(".chat-user-info").addClass("show");
        $(".chat-bottom").addClass("small");
    });
    /* -- Close User Info -- */
    $("#close-user-info").on("click", function(e) {
        e.preventDefault();
        $(".chat-user-info").removeClass("show");
        $(".chat-bottom").removeClass("small");
    });
    /* -- Collapse Chat Rightbar -- */
    $(".chat-userlist .nav-link").on("click", function(e) {
        e.preventDefault();
        $(".chat-rightbar").addClass("show");
    });
    /* -- Back Chat Rightbar -- */
    $(".back-arrow").on("click", function(e) {
        e.preventDefault();
        $(".chat-rightbar").removeClass("show");
    });
    /* -- User Media Slider -- */
    $('.user-media-slider').slick({
        infinite: true,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        prevArrow: '<i class="feather icon-chevron-left"></i>',
        nextArrow: '<i class="feather icon-chevron-right"></i>'
    });
   
    /* -- Bootstrap Popover -- */
    $('[data-toggle="popover"]').popover();
    /* -- Bootstrap Tooltip -- */
    $('[data-toggle="tooltip"]').tooltip();
});