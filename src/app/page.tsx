"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { districts } from "@/constants/districts";
import { formSchema, type FormData } from "@/schemas/formSchema";
import { adToBs, bsToAd } from "@/utils/dateConvert";
import { fileToBase64 } from "@/utils/fileToBase64";
import { convertToNepali } from "@/utils/nepaliUnicode";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function Home() {
  const [step, setStep] = useState(1);
  const [nepaliText, setNepaliText] = useState("");
  const [frontFileLoading, setFrontFileLoading] = useState(false);
  const [backFileLoading, setBackFileLoading] = useState(false);
  const [frontFilePreview, setFrontFilePreview] = useState<{
    file: File;
    url?: string;
  } | null>(null);
  const [backFilePreview, setBackFilePreview] = useState<{
    file: File;
    url?: string;
  } | null>(null);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    file?: File;
    url?: string;
    type?: string;
  }>({ isOpen: false });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const watchedValues = watch();
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    const currentYear = new Date().getFullYear();
    const birthYear = new Date(dateOfBirth).getFullYear();
    return currentYear - birthYear;
  };

  const age = calculateAge(watchedValues.dateOfBirthAD || "");

  const openPreviewModal = (file: File, url?: string) => {
    setPreviewModal({
      isOpen: true,
      file,
      url,
      type: file.type,
    });
  };

  const closePreviewModal = () => {
    setPreviewModal({ isOpen: false });
  };

  const isStep2Valid = () => {
    const { citizenshipNumber, issuedDistrict, issuedDateAD, issuedDateBS } =
      watchedValues;
    return !!(
      citizenshipNumber?.trim() &&
      issuedDistrict?.trim() &&
      issuedDateAD?.trim() &&
      issuedDateBS?.trim()
    );
  };

  const handleNepaliKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      e.preventDefault();
      const converted = convertToNepali(nepaliText);
      setNepaliText(converted + " ");
      setValue("fullNameNepali", converted + " ");
    }
  };

  const handleNepaliChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNepaliText(value);
    setValue("fullNameNepali", value);
  };

  const handleDateOfBirthADChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const adDate = e.target.value;
    setValue("dateOfBirthAD", adDate);
    setValue("dateOfBirthBS", adToBs(adDate));
  };

  const handleDateOfBirthBSChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const bsDate = e.target.value;
    setValue("dateOfBirthBS", bsDate);
    setValue("dateOfBirthAD", bsToAd(bsDate));
  };

  const handleIssuedDateADChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const adDate = e.target.value;
    setValue("issuedDateAD", adDate);
    setValue("issuedDateBS", adToBs(adDate));
  };

  const handleIssuedDateBSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bsDate = e.target.value;
    setValue("issuedDateBS", bsDate);
    setValue("issuedDateAD", bsToAd(bsDate));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("File size must be less than 2 MB");
      e.target.value = "";
      return;
    }

    if (type === "front") {
      setFrontFileLoading(true);
      setValue("citizenshipFront", file);

      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setFrontFilePreview({ file, url });
      } else {
        setFrontFilePreview({ file });
      }
      setFrontFileLoading(false);
    } else {
      setBackFileLoading(true);
      setValue("citizenshipBack", file);

      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setBackFilePreview({ file, url });
      } else {
        setBackFilePreview({ file });
      }
      setBackFileLoading(false);
    }
  };

  const handleContinue = async () => {
    const step1Fields = [
      "fullNameEnglish",
      "gender",
      "dateOfBirthAD",
      "dateOfBirthBS",
      "phoneNumber",
    ] as const;
    const isStep1Valid = await trigger(step1Fields);

    if (isStep1Valid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: FormData) => {
    let citizenshipFrontBase64 = "";
    let citizenshipBackBase64 = "";

    if (data.citizenshipFront) {
      citizenshipFrontBase64 = await fileToBase64(data.citizenshipFront);
    }

    if (data.citizenshipBack) {
      citizenshipBackBase64 = await fileToBase64(data.citizenshipBack);
    }

    console.warn("form submitted successfully");
    console.log({
      formData: data,
      citizenshipFrontBase64,
      citizenshipBackBase64,
    });

    // Show success dialog to user
    alert("Form submitted successfully! Thank you for your submission.");

    // Refresh the page
    // window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F5F8FF] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#111827] mb-2">
            Insurtech Nepal
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm ${
                  step >= 1
                    ? "bg-[#2563EB] text-white"
                    : "bg-[#E5E7EB] text-[#6B7280]"
                }`}
              >
                1
              </div>
              <span
                className={`ml-3 text-sm font-medium ${
                  step >= 1 ? "text-[#2563EB]" : "text-[#6B7280]"
                }`}
              >
                Personal Information
              </span>
            </div>

            <div
              className={`mx-6 h-px w-16 ${
                step >= 2 ? "bg-[#2563EB]" : "bg-[#E5E7EB]"
              }`}
            ></div>

            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm ${
                  step >= 2
                    ? "bg-[#2563EB] text-white"
                    : "bg-[#E5E7EB] text-[#6B7280]"
                }`}
              >
                2
              </div>
              <span
                className={`ml-3 text-sm font-medium ${
                  step >= 2 ? "text-[#2563EB]" : "text-[#6B7280]"
                }`}
              >
                Document Information
              </span>
            </div>
          </div>
        </div>

        {/* Form Card  */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
          <div className="border-b border-[#E5E7EB] px-6 py-4">
            <h2 className="text-lg font-medium text-[#111827]">
              {step === 1 ? "Personal Information" : "Document Information"}
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">
              {step === 1
                ? "Please provide your personal details"
                : "Upload required documents"}
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="fullNameEnglish"
                        className="text-sm font-medium text-[#111827]"
                      >
                        Full Name (English){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullNameEnglish"
                        {...register("fullNameEnglish")}
                        placeholder="Enter your full name in English"
                        className="bg-white border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] placeholder:text-[#6B7280] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                      />
                      {errors.fullNameEnglish && (
                        <p className="text-red-500 text-sm">
                          {errors.fullNameEnglish.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="fullNameNepali"
                        className="text-sm font-medium text-[#111827]"
                      >
                        Full Name (Nepali){" "}
                        <span className="text-[#6B7280] text-xs">Optional</span>
                      </Label>
                      <Input
                        id="fullNameNepali"
                        value={nepaliText}
                        onChange={handleNepaliChange}
                        onKeyDown={handleNepaliKeyPress}
                        placeholder="Type in Roman, press SPACE to convert"
                        className="bg-white border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] placeholder:text-[#6B7280] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                      />
                      <p className="text-xs text-[#6B7280]">
                        Type Roman letters and press SPACE to convert to Nepali
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#111827]">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setValue(
                            "gender",
                            value as "male" | "female" | "other"
                          )
                        }
                      >
                        <SelectTrigger className="bg-white border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-[#E5E7EB] shadow-lg rounded-md">
                          <SelectItem
                            value="male"
                            className="hover:bg-[#F5F8FF] cursor-pointer px-3 py-2"
                          >
                            Male
                          </SelectItem>
                          <SelectItem
                            value="female"
                            className="hover:bg-[#F5F8FF] cursor-pointer px-3 py-2"
                          >
                            Female
                          </SelectItem>
                          <SelectItem
                            value="other"
                            className="hover:bg-[#F5F8FF] cursor-pointer px-3 py-2"
                          >
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && (
                        <p className="text-red-500 text-sm">
                          {errors.gender.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phoneNumber"
                        className="text-sm font-medium text-[#111827]"
                      >
                        Phone Number{" "}
                        {age > 18 && watchedValues.gender === "male" && (
                          <span className="text-red-500">*</span>
                        )}
                      </Label>
                      <Input
                        id="phoneNumber"
                        {...register("phoneNumber")}
                        placeholder="Enter your phone number"
                        className="bg-white border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] placeholder:text-[#6B7280] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-sm">
                          {errors.phoneNumber.message}
                        </p>
                      )}
                      {age > 18 && watchedValues.gender === "male" && (
                        <p className="text-[#6B7280] text-xs">
                          Required for males over 18
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="dateOfBirthAD"
                        className="text-sm font-medium text-[#111827]"
                      >
                        Date of Birth (AD){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dateOfBirthAD"
                        type="date"
                        value={watchedValues.dateOfBirthAD || ""}
                        onChange={handleDateOfBirthADChange}
                        className="bg-white border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                      />
                      {errors.dateOfBirthAD && (
                        <p className="text-red-500 text-sm">
                          {errors.dateOfBirthAD.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="dateOfBirthBS"
                        className="text-sm font-medium text-[#111827]"
                      >
                        Date of Birth (BS){" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dateOfBirthBS"
                        type="text"
                        value={watchedValues.dateOfBirthBS || ""}
                        onChange={handleDateOfBirthBSChange}
                        placeholder="YYYY-MM-DD"
                        className="bg-white border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] placeholder:text-[#6B7280] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                      />
                      <p className="text-xs text-[#6B7280]">
                        Format: YYYY-MM-DD (English numerals)
                      </p>
                    </div>
                  </div>

                  {age > 0 && (
                    <div className="bg-[#F5F8FF] border border-[#E5E7EB] p-4 rounded-md">
                      <p className="text-[#2563EB] font-medium">
                        Calculated Age: {age} years
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={handleContinue}
                      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2 rounded-md font-medium transition-colors"
                    >
                      Continue to Document Information
                    </Button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="citizenshipNumber"
                        className="text-sm font-medium text-[#111827]"
                      >
                        Citizenship Number{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="citizenshipNumber"
                        {...register("citizenshipNumber")}
                        placeholder="Enter citizenship number"
                        className="bg-white border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] placeholder:text-[#6B7280] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                      />
                      {errors.citizenshipNumber && (
                        <p className="text-red-500 text-sm">
                          {errors.citizenshipNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#111827]">
                        Issued District <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setValue("issuedDistrict", value)
                        }
                      >
                        <SelectTrigger className="bg-white border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors">
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-[#E5E7EB] shadow-lg rounded-md">
                          {districts.map((district) => (
                            <SelectItem
                              key={district}
                              value={district}
                              className="hover:bg-[#F5F8FF] cursor-pointer px-3 py-2"
                            >
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.issuedDistrict && (
                        <p className="text-red-500 text-sm">
                          {errors.issuedDistrict.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="issuedDateAD"
                        className="text-sm font-medium text-[#111827]"
                      >
                        Issued Date (AD) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="issuedDateAD"
                        type="date"
                        value={watchedValues.issuedDateAD || ""}
                        onChange={handleIssuedDateADChange}
                        className="bg-white border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                      />
                      {errors.issuedDateAD && (
                        <p className="text-red-500 text-sm">
                          {errors.issuedDateAD.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="issuedDateBS"
                        className="text-sm font-medium text-[#111827]"
                      >
                        Issued Date (BS) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="issuedDateBS"
                        type="text"
                        value={watchedValues.issuedDateBS || ""}
                        onChange={handleIssuedDateBSChange}
                        placeholder="YYYY-MM-DD"
                        className="bg-white border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] placeholder:text-[#6B7280] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                      />
                      <p className="text-xs text-[#6B7280]">
                        Format: YYYY-MM-DD (English numerals)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 mt-8">
                    <div className="space-y-2">
                      <Label
                        htmlFor="citizenshipFront"
                        className="text-sm font-medium text-[#111827]"
                      >
                        Citizenship Front{" "}
                        <span className="text-[#6B7280] text-xs">
                          (jpg/png/pdf, max 2MB)
                        </span>
                      </Label>
                      <Input
                        id="citizenshipFront"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileUpload(e, "front")}
                        className="bg-white border-[#E5E7EB] rounded-md file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#F5F8FF] file:text-[#2563EB] hover:file:bg-[#E5E7EB] transition-colors"
                      />
                      {frontFileLoading && (
                        <div className="flex items-center gap-2 text-[#2563EB] bg-[#F5F8FF] p-3 rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Processing file...</span>
                        </div>
                      )}
                      {frontFilePreview && !frontFileLoading && (
                        <div className="border border-[#E5E7EB] rounded-md p-3 bg-[#F5F8FF]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[#111827]">
                              <FileText className="h-6 w-6 text-[#2563EB]" />
                              <div>
                                <p className="font-medium">
                                  {frontFilePreview.file.name}
                                </p>
                                <p className="text-sm text-[#2563EB]">
                                  File uploaded successfully
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openPreviewModal(
                                  frontFilePreview.file,
                                  frontFilePreview.url
                                )
                              }
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      )}
                      {errors.citizenshipFront && (
                        <p className="text-red-500 text-sm">
                          {errors.citizenshipFront.message?.toString()}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="citizenshipBack"
                        className="text-sm font-medium text-[#111827]"
                      >
                        Citizenship Back{" "}
                        <span className="text-[#6B7280] text-xs">
                          (jpg/png/pdf, max 2MB)
                        </span>
                      </Label>
                      <Input
                        id="citizenshipBack"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileUpload(e, "back")}
                        className="bg-white border-[#E5E7EB] rounded-md file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#F5F8FF] file:text-[#2563EB] hover:file:bg-[#E5E7EB] transition-colors"
                      />
                      {backFileLoading && (
                        <div className="flex items-center gap-2 text-[#2563EB] bg-[#F5F8FF] p-3 rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Processing file...</span>
                        </div>
                      )}
                      {backFilePreview && !backFileLoading && (
                        <div className="border border-[#E5E7EB] rounded-md p-3 bg-[#F5F8FF]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[#111827]">
                              <FileText className="h-6 w-6 text-[#2563EB]" />
                              <div>
                                <p className="font-medium">
                                  {backFilePreview.file.name}
                                </p>
                                <p className="text-sm text-[#2563EB]">
                                  File uploaded successfully
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openPreviewModal(
                                  backFilePreview.file,
                                  backFilePreview.url
                                )
                              }
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      )}
                      {errors.citizenshipBack && (
                        <p className="text-red-500 text-sm">
                          {errors.citizenshipBack.message?.toString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-8 border-t border-[#E5E7EB]">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      className="bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#F5F8FF] px-6 py-2 rounded-md font-medium transition-colors"
                    >
                      Back to Personal Info
                    </Button>
                    {isStep2Valid() && (
                      <Button
                        type="submit"
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2 rounded-md font-medium transition-colors ml-auto"
                      >
                        Submit Form
                      </Button>
                    )}
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      <Dialog open={previewModal.isOpen} onOpenChange={closePreviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>File Preview - {previewModal.file?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewModal.type?.startsWith("image/") && previewModal.url ? (
              <img
                src={previewModal.url}
                alt="File preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded-md"
              />
            ) : previewModal.type === "application/pdf" ? (
              <div className="bg-gray-100 p-8 rounded-md text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">PDF preview not available</p>
                <p className="text-sm text-gray-500">
                  File: {previewModal.file?.name}
                </p>
                <p className="text-sm text-gray-500">
                  Size:{" "}
                  {previewModal.file
                    ? (previewModal.file.size / 1024 / 1024).toFixed(2)
                    : 0}{" "}
                  MB
                </p>
              </div>
            ) : (
              <div className="bg-gray-100 p-8 rounded-md text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  Preview not available for this file type
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
