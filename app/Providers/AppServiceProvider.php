<?php

namespace App\Providers;

use App\Models\Faq;
use App\Models\Blog;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Service;
use App\Models\Category;
use App\Models\PricePlan;
use App\Models\TeamMember;
use App\Models\MailSetting;
use App\Models\Testimonial;
use App\Models\WebsiteSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //

        # category
        // $category = $this->app->make('category');
        // $category = Category::all();
        // dd($category->count());
        // view()->share('category', $category);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //

        if (!app()->runningInConsole() || app()->runningUnitTests()) {
            // $general_setting = DB::table('categories')->latest()->first();
            //...

            // All Model
            $serviceCategory = Service::where('cat_id', 17)->with('category')->get();
            $service = Service::all();
            $blog = Blog::latest()->take(6)->inRandomOrder()->get();
            $partner = Partner::all();
            $team = TeamMember::all();
            $pricePlan = PricePlan::all();
            $testimonial = Testimonial::all();
            $faq = Faq::all();
            $category = Category::get();
            $TotalBlog = Blog::all();
            $categorylist = Category::all();
            $website = WebsiteSetting::first();

            view()->share('categorylist', $categorylist);

            //Pages
            $page = Page::first();

            # Mail Setting
            $mailSetting = MailSetting::first();

            if(!empty($mailSetting)){
                $data_mail = [
                    'drive' => $mailSetting->mail_driver,
                    'host' => $mailSetting->mail_host,
                    'port' => $mailSetting->mail_port,
                    'encryption' => $mailSetting->mail_encryption,
                    'username' => $mailSetting->mail_username,
                    'password' => $mailSetting->mail_password,
                    'form' => [
                        'address' => $mailSetting->mail_form_address,
                        'name' => $mailSetting->mail_form_name,
                    ]
                ];
                Config::set('mail',$data_mail);
            }

            $data = [
                'serviceCategory' => $serviceCategory,
                'service' => $service,
                'blog' => $blog,
                'partner' => $partner,
                'team' => $team,
                'pricePlan' => $pricePlan,
                'testimonial' => $testimonial,
                'faq' => $faq,
                'category' => $category,
                'TotalBlog' => $TotalBlog,
            ];

            // Partage global (inchangé)
            View::share([
                'category' => $category,
                'TotalBlog' => $TotalBlog,
                'pricePlan' => $pricePlan,
                'serviceCategory' => $serviceCategory,
                'service' => $service,
                'blog' => $blog,
                'partner' => $partner,
                'team' => $team,
                'testimonial' => $testimonial,
                'faq' => $faq,
                'website' => $website,
                'mailSetting' => $mailSetting,
                'page' => $page,
            ]);

            // --- NOUVEAU : View Composer pour afficher les pages publiées dans le frontend ---
            View::composer('website.components.TopHeader', function ($view) {
                $publishedPages = Page::where('pageStatus', 'publish') // pages publiées
                    ->orderBy('menu_order', 'asc')                     // si tu as un ordre
                    ->get(['pageName', 'slug']);                       // récupérer juste ce qui est nécessaire

                $view->with('publishedPages', $publishedPages);
            });
        }
    }
}

