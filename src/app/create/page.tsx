"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";

// 定义协议表单数据类型
interface ConsentFormData {
  agreementTitle: string;
  date: string;
  party1Name: string;
  party1ID: string;
  party2Name: string;
  party2ID: string;
  consentDetails: string;
  safetyMeasures: string[];
  privacyTerms: string;
  revocationTerms: string;
  additionalTerms?: string;
}

// 同意书的本地存储键
const STORAGE_KEY = "consent-agreements";

// 添加协议模板定义
const agreementTemplates = [
  {
    id: "template-basic",
    name: "基础同意协议",
    description: "最基本的性同意协议，包含必要的同意表述和安全措施",
    consentDetails:
      "我们双方在完全自愿、理性和清醒的状态下，同意进行亲密行为。我们确认彼此已经达到法定成年年龄，并且对可能发生的行为有充分理解。我们承诺相互尊重对方的边界和意愿，任何一方都有权随时终止行为而无需解释原因。",
    safetyOptions: {
      contraception: true,
      sti_testing: true,
      safe_words: true,
      no_recording: true,
      other: false,
    },
    privacyTerms:
      "我们承诺对本次关系的细节保持私密，不向第三方分享对方的隐私信息。我们同意不在未经对方明确许可的情况下，向任何人透露此次互动的具体细节。",
    revocationTerms:
      "任何一方都可以在任何时候撤回同意，而无需提供理由。撤回同意应该被尊重和立即执行，不得有任何形式的强迫或胁迫。",
  },
  {
    id: "template-detailed",
    name: "详细同意协议",
    description: "更详细的性同意协议，包含具体行为边界和个人偏好",
    consentDetails:
      "我们双方在完全自愿、理性和清醒的状态下，同意进行亲密行为。我们确认彼此已经达到法定成年年龄，并且对可能发生的行为有充分理解。我们已经讨论并同意了可接受的互动范围，包括但不限于哪些行为是可以的，哪些是不可接受的。我们将在整个过程中保持沟通，并尊重彼此设定的边界。我们理解，即使之前同意了某种行为，任何一方在任何时候都有权改变主意。",
    safetyOptions: {
      contraception: true,
      sti_testing: true,
      safe_words: true,
      no_recording: true,
      other: true,
    },
    privacyTerms:
      "我们承诺对本次关系的细节保持私密，不向第三方分享对方的隐私信息。未经明确同意，不得分享、发布或传播与对方相关的任何信息、照片或录像。此外，我们同意在社交媒体上不发布任何可能暗示或揭示我们关系的内容。",
    revocationTerms:
      "任何一方都可以在任何时候撤回同意，而无需提供理由。我们同意使用安全词系统：红灯表示立即停止当前行为；黄灯表示放慢或调整当前行为。一旦安全词被使用，另一方应立即响应并停止或调整行为。",
  },
  {
    id: "template-long-term",
    name: "长期关系协议",
    description: "适用于长期伴侣的性同意协议，包含更多关系维护内容",
    consentDetails:
      "作为长期伴侣关系的一部分，我们同意在我们关系中的亲密行为应基于相互尊重、信任和持续的沟通。我们承诺定期讨论和更新我们的边界和舒适区，并且尊重这些边界。我们理解，即使在长期关系中，每次亲密行为都需要双方的积极同意，而非被动不拒绝。我们同意在情绪不佳、压力大或其他影响判断的情况下，可以暂缓亲密行为，而不会对关系产生负面影响。",
    safetyOptions: {
      contraception: true,
      sti_testing: true,
      safe_words: true,
      no_recording: false,
      other: true,
    },
    privacyTerms:
      "作为长期伴侣，我们同意尊重彼此的隐私和数字边界。未经明确同意，不得分享或向第三方透露彼此的亲密细节。如果关系状态发生变化，我们同意保护彼此过去的隐私，不将亲密细节作为谈资或报复手段。",
    revocationTerms:
      "即使在长期关系中，我们认可任何一方都有权在任何时候撤回同意的权利。我们承诺不会因为对方拒绝亲密行为而施加情感压力或消极反应。我们同意建立一个安全的沟通环境，使双方都能自由表达自己的意愿和边界，而不担心遭到批评或拒绝。",
  },
];

export default function CreateAgreement() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [safetyOptions, setSafetyOptions] = useState<{
    contraception: boolean;
    sti_testing: boolean;
    safe_words: boolean;
    no_recording: boolean;
    other: boolean;
  }>({
    contraception: false,
    sti_testing: false,
    safe_words: false,
    no_recording: false,
    other: false,
  });

  // 添加模板选择状态
  const [showTemplates, setShowTemplates] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ConsentFormData>({
    defaultValues: {
      agreementTitle: `同意协议 - ${new Date().toLocaleDateString("zh-CN")}`,
      date: new Date().toISOString().split("T")[0],
      safetyMeasures: [],
    },
  });

  // 监听双方姓名变化，自动生成标题
  const party1Name = watch("party1Name");
  const party2Name = watch("party2Name");

  useEffect(() => {
    if (party1Name && party2Name) {
      setValue("agreementTitle", `${party1Name}与${party2Name}性同意协议`);
    }
  }, [party1Name, party2Name, setValue]);

  // 处理表单提交
  const onSubmit: SubmitHandler<ConsentFormData> = (data) => {
    // 处理安全措施选项
    const safetyMeasuresArray: string[] = [];
    if (safetyOptions.contraception) safetyMeasuresArray.push("使用避孕措施");
    if (safetyOptions.sti_testing) safetyMeasuresArray.push("性传播疾病检测");
    if (safetyOptions.safe_words) safetyMeasuresArray.push("使用安全词");
    if (safetyOptions.no_recording) safetyMeasuresArray.push("禁止录音录像");
    if (safetyOptions.other) safetyMeasuresArray.push("其他措施");

    // 创建完整协议对象
    const agreement = {
      id: uuidv4(),
      ...data,
      safetyMeasures: safetyMeasuresArray,
      createdAt: new Date().toISOString(),
    };

    // 保存到本地存储
    const existingAgreements = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...existingAgreements, agreement])
    );

    // 修改为使用前端路由而不是直接导航
    // 对于静态导出，我们可以添加查询参数到基本路径
    // 在协议列表页面，我们会处理这个URL参数
    router.push(`/agreements?view=${agreement.id}`);
  };

  // 处理安全措施选项切换
  const handleSafetyOptionChange = (option: keyof typeof safetyOptions) => {
    setSafetyOptions({
      ...safetyOptions,
      [option]: !safetyOptions[option],
    });
  };

  // 移动到下一步
  const nextStep = () => setStep(step + 1);

  // 移动到上一步
  const prevStep = () => setStep(step - 1);

  // 添加应用模板功能
  const applyTemplate = (templateId: string) => {
    const template = agreementTemplates.find((t) => t.id === templateId);
    if (template) {
      // 设置表单值
      setValue("consentDetails", template.consentDetails);
      setValue("privacyTerms", template.privacyTerms);
      setValue("revocationTerms", template.revocationTerms);

      // 设置安全选项
      setSafetyOptions(template.safetyOptions);

      // 关闭模板选择
      setShowTemplates(false);

      // 如果在第一步，直接跳到第二步
      if (step === 1) {
        nextStep();
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="modern-card p-8 mb-8">
        <h1 className="text-4xl font-bold mb-8 text-center gradient-text">创建性同意协议</h1>

        {/* 步骤指示器 */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 ${
                  step >= stepNum 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg' 
                    : 'bg-gray-300'
                }`}>
                  {stepNum}
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  step >= stepNum ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {stepNum === 1 && '基本信息'}
                  {stepNum === 2 && '详细条款'}
                  {stepNum === 3 && '安全与隐私'}
                  {stepNum === 4 && '确认提交'}
                </span>
              </div>
            ))}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 -z-10">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 第一步：基本信息 */}
        {step === 1 && (
          <div className="modern-card p-8 animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">基本信息</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-gray-700">参与方1姓名</span>
                  </label>
                  <input
                    type="text"
                    className="modern-input input w-full"
                    placeholder="请输入参与方1姓名"
                    {...register("party1Name", { required: "请输入参与方1姓名" })}
                  />
                  {errors.party1Name && (
                    <p className="text-red-500 mt-2 text-sm">{errors.party1Name.message}</p>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-gray-700">参与方2姓名</span>
                  </label>
                  <input
                    type="text"
                    className="modern-input input w-full"
                    placeholder="请输入参与方2姓名"
                    {...register("party2Name", { required: "请输入参与方2姓名" })}
                  />
                  {errors.party2Name && (
                    <p className="text-red-500 mt-2 text-sm">{errors.party2Name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-gray-700">参与方1身份证号</span>
                  </label>
                  <input
                    type="text"
                    className="modern-input input w-full"
                    placeholder="请输入参与方1身份证号"
                    {...register("party1ID", {
                      required: "请输入参与方1身份证号",
                      pattern: {
                        value: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
                        message: "请输入有效的身份证号",
                      },
                    })}
                  />
                  {errors.party1ID && (
                    <p className="text-red-500 mt-2 text-sm">{errors.party1ID.message}</p>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-gray-700">参与方2身份证号</span>
                  </label>
                  <input
                    type="text"
                    className="modern-input input w-full"
                    placeholder="请输入参与方2身份证号"
                    {...register("party2ID", {
                      required: "请输入参与方2身份证号",
                      pattern: {
                        value: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
                        message: "请输入有效的身份证号",
                      },
                    })}
                  />
                  {errors.party2ID && (
                    <p className="text-red-500 mt-2 text-sm">{errors.party2ID.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-gray-700">日期</span>
                  </label>
                  <input
                    type="date"
                    className="modern-input input w-full"
                    {...register("date", { required: "请选择日期" })}
                  />
                  {errors.date && (
                    <p className="text-red-500 mt-2 text-sm">{errors.date.message}</p>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-gray-700">协议标题</span>
                    <span className="label-text-alt text-gray-500">填写双方姓名后自动生成</span>
                  </label>
                  <input
                    type="text"
                    className="modern-input input w-full"
                    placeholder="协议标题"
                    {...register("agreementTitle", { required: "请输入协议标题" })}
                  />
                  {errors.agreementTitle && (
                    <p className="text-red-500 mt-2 text-sm">
                      {errors.agreementTitle.message}
                    </p>
                  )}
                </div>
              </div>

              {/* 添加模板选择按钮 */}
              <div className="form-control">
                <button
                  type="button"
                  className="btn btn-outline w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-300 font-semibold py-3"
                  onClick={() => setShowTemplates(!showTemplates)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {showTemplates ? "隐藏模板选择" : "选择协议模板"}
                </button>
              </div>

              {/* 模板列表 */}
              {showTemplates && (
                <div className="glass-effect p-6 rounded-2xl">
                  <h3 className="font-bold mb-6 text-center text-xl gradient-text">选择一个模板快速创建</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {agreementTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="modern-card p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                        onClick={() => applyTemplate(template.id)}
                      >
                        <h4 className="card-title text-lg font-bold mb-3 group-hover:text-blue-600 transition-colors">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {template.description}
                        </p>
                        <button
                          type="button"
                          className="modern-button btn btn-sm w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            applyTemplate(template.id);
                          }}
                        >
                          使用此模板
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Link href="/" className="btn btn-outline border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 font-semibold px-8">
                  取消
                </Link>
                <button
                  type="button"
                  className="modern-button btn px-8 font-semibold"
                  onClick={nextStep}
                >
                  下一步
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 第二步：详细条款 */}
        {step === 2 && (
          <div className="modern-card p-8 animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">详细条款</h2>
            <div className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-gray-700">同意详情</span>
                </label>
                <textarea
                  className="modern-input textarea h-32 w-full"
                  placeholder="请详细描述双方同意的性行为范围和内容..."
                  {...register("consentDetails", { required: "请输入同意详情" })}
                ></textarea>
                {errors.consentDetails && (
                  <p className="text-red-500 mt-2 text-sm">
                    {errors.consentDetails.message}
                  </p>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-gray-700">安全措施</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={safetyOptions.contraception}
                      onChange={() => handleSafetyOptionChange("contraception")}
                    />
                    <span className="font-medium">使用避孕措施</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={safetyOptions.sti_testing}
                      onChange={() => handleSafetyOptionChange("sti_testing")}
                    />
                    <span className="font-medium">性传播疾病检测</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={safetyOptions.safe_words}
                      onChange={() => handleSafetyOptionChange("safe_words")}
                    />
                    <span className="font-medium">使用安全词</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={safetyOptions.no_recording}
                      onChange={() => handleSafetyOptionChange("no_recording")}
                    />
                    <span className="font-medium">禁止录音录像</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors md:col-span-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={safetyOptions.other}
                      onChange={() => handleSafetyOptionChange("other")}
                    />
                    <span className="font-medium">其他措施</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="btn btn-outline border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 font-semibold px-8"
                  onClick={prevStep}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  上一步
                </button>
                <button
                  type="button"
                  className="modern-button btn px-8 font-semibold"
                  onClick={nextStep}
                >
                  下一步
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 第三步：安全与隐私 */}
        {step === 3 && (
          <div className="modern-card p-8 animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">安全与隐私</h2>
            <div className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-gray-700">隐私条款</span>
                </label>
                <textarea
                  className="modern-input textarea h-24 w-full"
                  placeholder="请描述关于隐私保护的条款..."
                  {...register("privacyTerms", { required: "请输入隐私条款" })}
                ></textarea>
                {errors.privacyTerms && (
                  <p className="text-red-500 mt-2 text-sm">{errors.privacyTerms.message}</p>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-gray-700">撤回同意条款</span>
                </label>
                <textarea
                  className="modern-input textarea h-24 w-full"
                  placeholder="请描述关于撤回同意的条款..."
                  {...register("revocationTerms", {
                    required: "请输入撤回同意条款",
                  })}
                ></textarea>
                {errors.revocationTerms && (
                  <p className="text-red-500 mt-2 text-sm">
                    {errors.revocationTerms.message}
                  </p>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-gray-700">额外条款（可选）</span>
                </label>
                <textarea
                  className="modern-input textarea h-24 w-full"
                  placeholder="请描述任何其他额外条款..."
                  {...register("additionalTerms")}
                ></textarea>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="btn btn-outline border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 font-semibold px-8"
                  onClick={prevStep}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  上一步
                </button>
                <button
                  type="button"
                  className="modern-button btn px-8 font-semibold"
                  onClick={nextStep}
                >
                  下一步
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 第四步：确认提交 */}
        {step === 4 && (
          <div className="modern-card p-8 animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">确认提交</h2>
            <div className="space-y-6">
              <div className="glass-effect p-6 rounded-2xl">
                <h3 className="text-xl font-bold mb-6 text-center">协议摘要</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600">协议标题</p>
                    <p className="text-lg font-medium">{watch("agreementTitle")}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600">日期</p>
                    <p className="text-lg font-medium">{watch("date")}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 mb-2">参与方</p>
                  <p className="text-lg font-medium">
                    {watch("party1Name")} 和 {watch("party2Name")}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 mb-2">同意详情</p>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="whitespace-pre-line text-gray-700">{watch("consentDetails")}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 mb-2">安全措施</p>
                  <div className="bg-white p-4 rounded-lg">
                    <ul className="space-y-1">
                      {safetyOptions.contraception && <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>使用避孕措施</li>}
                      {safetyOptions.sti_testing && <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>性传播疾病检测</li>}
                      {safetyOptions.safe_words && <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>使用安全词</li>}
                      {safetyOptions.no_recording && <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>禁止录音录像</li>}
                      {safetyOptions.other && <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>其他措施</li>}
                    </ul>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 mb-2">隐私条款</p>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="whitespace-pre-line text-gray-700">{watch("privacyTerms")}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 mb-2">撤回同意条款</p>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="whitespace-pre-line text-gray-700">
                      {watch("revocationTerms")}
                    </p>
                  </div>
                </div>

                {watch("additionalTerms") && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-600 mb-2">额外条款</p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="whitespace-pre-line text-gray-700">
                        {watch("additionalTerms")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="flex items-center gap-3 cursor-pointer justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <input type="checkbox" className="checkbox checkbox-primary" required />
                  <span className="font-medium">我确认以上信息真实有效，且双方自愿签署本协议</span>
                </label>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="btn btn-outline border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 font-semibold px-8"
                  onClick={prevStep}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  上一步
                </button>
                <button type="submit" className="modern-button btn px-8 font-semibold">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  创建协议
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
