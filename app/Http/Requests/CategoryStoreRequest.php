<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'CategoryName' => 'required|unique:categories,name',
            'type' => 'required',
            'status' => 'required',
            'imgUpload' => 'required',
        ];
    }

    // # custom message
    public function messages()
    {
        return [
            'CategoryName' => 'Category name is Empty.Please enter Category name.',
            'type' => 'Type is Empty.Please Choose a Type',
            'status' => 'Status is Empty.Please Select your Status.',
            'imgUpload' => 'Please Enter your Picture',

            //custom more message
            // 'contactNumber.required' => 'Contact number is Empty.Please enter contact number.',
            // 'contactNumber.numeric' => 'Contact number only number allow.',
            // 'contactNumber.min' => 'Contact number must be 11 digits.',

            // 'doctorName' => 'Doctor name is Empty.Please enter doctor name.',
            // 'doctorAddress' => 'Doctor address is Empty.Please enter doctor address.',
        ];

        //  [
        //         'CategoryName.required' => 'Category Name is Required',
        //         'CategoryName.unique' => 'Category Name Already Exist',
        //         'type.required' => 'Type is Required',
        //         'status.required' => 'Status is Required'
        //     ];
    }
}
