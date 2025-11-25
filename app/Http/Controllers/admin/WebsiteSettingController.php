<?php

namespace App\Http\Controllers\admin;

use App\Models\MailSetting;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\WebsiteSetting;
use App\Service\FileUploadService;

use App\Http\Controllers\Controller;
use function App\Helper\deleteImage;
use function App\Helper\uploadImage;

class WebsiteSettingController extends Controller
{


    public function __construct(private readonly FileUploadService $fileUploadService)
    {
        // Constructor logic if needed
        
        
    }
    
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        return view('backend.websiteSetting.index');
    }


    public function Setting(WebsiteSetting $WebsiteSetting)
    {

        // return 123456;
        return $WebsiteSetting;
    }

    public function website()
    {


        $website = WebsiteSetting::first();
        // return $website;


        return view('backend.websiteSetting.website', compact('website'));
    }

    public function websiteUpdate(Request $request, WebsiteSetting $website)
    {

        // $website->site_name = request('site_name');
        // $website->site_title = request('site_title');

        $website->site_name = $request->input('site_name');
        $website->site_title = $request->input('site_title');

        # Color Setting 
        $website->primary_color = $request->input('primary_color');
        $website->secondary_color = $request->input('secondary_color');
        $website->title_color = $request->input('title_color');
        $website->text_color = $request->input('text_color');
        $website->body_color = $request->input('body_color');
        $website->primary_font = $request->input('primary_font');
        $website->secondary_font = $request->input('secondary_font');



        // $website->keywords = request('keywords');
        // $website->favicon = request('favicon');
        // $website->image = request('image');

        $website->save();

        $notification = array(
            'alert-type' => 'success',
            'message' => 'Website Updated Successfully',
        );

        return redirect()->route('setting.website')->with($notification);

        // return view('backend.websiteSetting.website');

    }

    public function SiteSetting(Request $request, WebsiteSetting $website)
    {

        # Site Setting 
        $website->site_name = $request->input('site_name');
        $website->site_title = $request->input('site_title');
        $website->site_email = $request->input('site_email');
        $website->site_phone = $request->input('site_phone');
        $website->site_address = $request->input('site_address');
        $website->site_description = $request->input('site_description');
        $website->site_map = $request->input('site_map');
        $website->meta_author = $request->input('meta_author');
        $website->site_copyright = $request->input('site_copyright');

        $website->save();

        $notification = array(
            'alert-type' => 'success',
            'message' => 'Site Setting Updated Successfully',
        );

        return redirect()->route('setting.website')->with($notification);
    }


    function ColorUpdate(Request $request, WebsiteSetting $website)
    {

        # Color Setting 

        # Backend Color Setting


        # Frontend Color Setting
        $website->primary_color = $request->input('primary_color');
        $website->secondary_color = $request->input('secondary_color');

        $website->title_color = $request->input('title_color');

        $website->text_color = $request->input('text_color');
        $website->text_color_hover = $request->input('text_color_hover');
        
        $website->icon_color = $request->input('icon_color');
        $website->icon_color_hover = $request->input('icon_color_hover');

        $website->body_color = $request->input('body_color');
        
        $website->primary_font = $request->input('primary_font');
        $website->secondary_font = $request->input('secondary_font');

        
        # 
        $website->active_bg_color = $request->input('active_bg_color');

        $website->active_text_color = $request->input('active_text_color');

        $website->save();

        $notification = array(
            'alert-type' => 'success',
            'message' => 'Color Setting Updated Successfully',
        );

        return redirect()->route('setting.website')->with($notification);
    }

    public function color()
    {


        return view('backend.websiteSetting.color');
    }

    /*
    SeoSetting update
    */

    public function ImageSetting(Request $request)
    {

        // return $website;

        $website = WebsiteSetting::first();

        // if($request->hasFile('site_logo')){
        //     // $website['site_logo'] = uploadImage($request->site_logo, 'website');
        //     $site_logo = uploadImage($request->file('site_logo'), 'website');
        //     $website->site_logo = $site_logo;

        //     deleteImage($website->site_logo);

        // }

        if ($request->hasFile('site_logo')) {

            # Delete OLD Image
            deleteImage($website->site_logo);

            // Image Upload With Helper Function
            $image = $request->file('site_logo');
            $num2 = (rand(100000000, 9999999999));
            $fileUrl = $num2 . '.' . $image->getClientOriginalExtension();
            $path = $image->move('uploads/website/', $fileUrl);
            $website->site_logo = $path;
          

        }

        if ($request->hasFile('white_logo')) {

            # Delete OLD Image
            deleteImage($website->site_WhiteLogo);

            // Image Upload With Helper Function
           $website['site_WhiteLogo'] = uploadImage($request->white_logo, 'website');
          
        }

        if ($request->hasFile('favicon')) {
             # Delete OLD Image
            deleteImage($website->site_favicon);
            // Image Upload With Helper Function
            // $website['site_favicon'] = uploadImage($request->favicon, 'website');
            $image = $request->file('favicon');
            // $num2 = (rand(100000000, 9999999999));
            $fileUrl = time(). '.' . $image->getClientOriginalExtension();
            $path = $image->move('uploads/website/', $fileUrl);
            // return $path;
            $website->site_favicon = $path;
       
        }


        # site_loader_image


        if ($request->hasFile('site_loader_image')) {
            # Delete OLD Image
            deleteImage($website->site_loader_image);
            
            // Image Upload With Helper Function
           // $website['site_loader_image'] = uploadImage($request->site_loader_image, 'website');

            $image = $request->file('site_loader_image');
            // $num2 = (rand(100000000, 9999999999));
            $fileUrl = time() . '.' . $image->getClientOriginalExtension();
            $path = $image->move('uploads/website/', $fileUrl);
            // return $path;
            $website->site_loader_image = $path;
        }

        $website->save();

        # Image Setting 

        // $website->site_logo = $request->input('site_logo');
        // $website->site_WhiteLogo = $request->input('white_logo');
        // $website->site_favicon = $request->input('favicon');

        // $image = $request->file('site_logo');
        // $filename = time() . '.' . $image->getClientOriginalExtension();
        // $url = $image->move('uploads/website/', $filename);
        // $website->site_logo = $url;
        // $website->site_WhiteLogo = $url;
        // $website->site_favicon = $url;

        // $site_logo = $request->file('site_logo');
        // $image_name = md5(rand(1000, 10000));
        // $ext = strtolower($site_logo->getClientOriginalExtension());
        // $image_full_name = $image_name . '.' . $ext;
        // $url =  $site_logo->move('uploads/website/', $image_full_name);
        // $website->site_logo = $url;


        #site logo

        // $site_logo = $request->file('site_logo');
        // $filename = time() . '.' . $site_logo->getClientOriginalExtension();
        // $url = $site_logo->move('uploads/website/', $filename);
        // $website->site_logo = $url;

        // $site_logo = uploadImage($request->file('site_logo'), 'uploads/website/');
        // $white_logo = uploadImage($request->file('white_logo'), 'uploads/website/');
        // $favicon= uploadImage($request->file('favicon'), 'uploads/website/');

        // $website->site_logo = $site_logo;
        // $website->site_WhiteLogo = $white_logo;
        // $website->site_favicon = $favicon;



        #white logo
        // $white_logo = $request->file('white_logo');
        // $filename1 = time() . '.' . $white_logo->getClientOriginalExtension();
        // $url1 = $white_logo->move('uploads/website/', $filename1);
        // $website->site_WhiteLogo = $url1;

        #favicon
        // $favicon = $request->file('favicon');
        // $filename2 = time() . '.' . $favicon->getClientOriginalExtension();
        // $url2 = $favicon->move('uploads/website/', $filename2);
        // $website->site_favicon = $url2;


        # Img upload 

        // if ($request->hasFile('white_logo')) {
        //     $image = $request->file('white_logo');
        //     $filename = time() . '.' . $image->getClientOriginalExtension();
        //     $url = $image->move('uploads/website/', $filename);

        //     $website->site_WhiteLogo = $url;
        // }
        // if ($request->hasFile('favicon')) {
        //     $image = $request->file('favicon');
        //     $filename = time() . '.' . $image->getClientOriginalExtension();
        //     $url = $image->move('uploads/website/', $filename);

        //     $website->site_favicon = $url;
        // }

        // else if($request->hasFile('white_logo')){
        //     $image = $request->file('white_logo');
        //     $filename = time() . '.' . $image->getClientOriginalExtension();
        //     $url = $image->move('uploads/website/', $filename);
        //     $website->image = $url;
        // }

        // else if($request->hasFile('favicon')){
        //     $image = $request->file('favicon');
        //     $filename = time() . '.' . $image->getClientOriginalExtension();
        //     $url = $image->move('uploads/website/', $filename);
        //     $website->image = $url;
        // }


        // $website->save();

        $notification = array(
            'alert-type' => 'success',
            'message' => 'Image Setting Updated Successfully',
        );

        return redirect()->route('setting.website')->with($notification);

        $website->save();
    }

    public function SeoSetting(Request $request, WebsiteSetting $website)
    {

        # Seo Setting 
        $website->meta_title = $request->input('meta_title');
        $website->meta_description = $request->input('meta_description');
        $website->meta_keywords = $request->input('meta_keywords');

        # Social Link
        $website->site_facebook = $request->input('site_facebook');
        $website->site_twitter = $request->input('site_twitter');
        $website->site_linkedin = $request->input('site_linkedin');
        $website->site_instagram = $request->input('site_instagram');
        $website->site_youtube = $request->input('site_youtube');

        $website->save();

        $notification = array(
            'alert-type' => 'success',
            'message' => 'SEO Setting Updated Successfully',
        );

        return redirect()->route('setting.website')->with($notification);
    }

    public function mailsetting()
    {


        return view('backend.websiteSetting.mailsetting');
    }

    public function mailUpdate(Request $request, MailSetting $MailSetting)
    {

        // return $MailSetting;

        $MailSetting->mail_driver = $request->mail_driver;
        $MailSetting->mail_host = $request->mail_host;
        $MailSetting->mail_port = $request->mail_port;
        $MailSetting->mail_encryption = $request->mail_encryption;
        $MailSetting->mail_username = $request->mail_username;
        $MailSetting->mail_password = $request->mail_password;

        $MailSetting->save();

        $notification = array(
            'alert-type' => 'success',
            'message' => 'Mail Setting Updated Successfully',
        );

        return redirect()->route('setting.mail-setting')->with($notification);
    }

    public function BasiMailUpdate(Request $request, MailSetting $MailSetting)
    {


        $MailSetting->mail_form_name = $request->mail_form_name;
        $MailSetting->mail_form_address = $request->mail_form_address;
        $MailSetting->mail_reply_email_address = $request->mail_reply_email_address;
        $MailSetting->save();

        $notification = array(
            'alert-type' => 'success',
            'message' => 'Basic Mail Setting Updated Successfully',
        );

        return redirect()->route('setting.mail-setting')->with($notification);
    }
}
