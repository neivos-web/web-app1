<?php

namespace App\Helpers;

class NotificationHelper
{
   public static function notify($message, $type , $title = null)
   {
      return [
         'type' => $type,
         'message' => $message,
         'title' => $title,
         'position' => 'top-right',
         'icon' => $type === 'success' ? 'ri-check-line' : 'ri-alert-line',
         'progressBar' => true,
         'timeOut' => 5000,
         'extendedTimeOut' => 1000,
         'closeButton' => true,
         'closeHtml' => '<button type="button" class="btn-close" aria-label="Close"></button>',
         'showMethod' => 'fadeIn',
         'hideMethod' => 'fadeOut',
      ];
   }
}
