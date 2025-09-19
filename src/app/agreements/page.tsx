"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";

// 性病检测类型定义
interface STITest {
  id: string;
  name: string;
  type: 'bacterial' | 'viral' | 'parasitic' | 'fungal';
  testMethod: string;
  detectionWindow: string;
  accuracy: string;
  cost: string;
  frequency: string;
  symptoms: string[];
  prevention: string[];
}

// 检测结果类型定义
interface TestResult {
  testId: string;
  testName: string;
  testDate: string;
  result: 'negative' | 'positive' | 'pending' | 'inconclusive';
  testLocation: string;
  nextTestDate?: string;
  notes?: string;
}

// 协议类型定义
interface Agreement {
  id: string;
  agreementTitle: string;
  date: string;
  party1Name: string;
  party2Name: string;
  createdAt: string;
  party1ID: string;
  party2ID: string;
  consentDetails: string;
  safetyMeasures: string[];
  privacyTerms: string;
  revocationTerms: string;
  additionalTerms?: string;
  party1Signed?: boolean;
  party2Signed?: boolean;
  party1SignedAt?: string;
  party2SignedAt?: string;
  party1Signature?: string;
  party2Signature?: string;
  party1Audio?: string;
  party2Audio?: string;
  party1TestResults?: TestResult[];
  party2TestResults?: TestResult[];
  stiTestingAgreement?: {
    requiredTests: string[];
    testingFrequency: string;
    sharingResults: boolean;
    retestRequired: boolean;
  };
}

// 本地存储键
const STORAGE_KEY = "consent-agreements";

// 性病检测数据库
const STI_TESTS: STITest[] = [
  {
    id: 'hiv',
    name: 'HIV检测',
    type: 'viral',
    testMethod: '血液检测/口腔拭子',
    detectionWindow: '2-4周（抗原检测），3-12周（抗体检测）',
    accuracy: '99.5%',
    cost: '免费-200元',
    frequency: '每3-6个月',
    symptoms: ['发热', '疲劳', '淋巴结肿大', '皮疹', '肌肉疼痛'],
    prevention: ['使用安全套', 'PrEP预防', '定期检测', '避免共用针具']
  },
  {
    id: 'syphilis',
    name: '梅毒检测',
    type: 'bacterial',
    testMethod: '血液检测',
    detectionWindow: '1-3周',
    accuracy: '99%',
    cost: '50-150元',
    frequency: '每3-6个月',
    symptoms: ['硬下疳', '皮疹', '发热', '头痛', '淋巴结肿大'],
    prevention: ['使用安全套', '定期检测', '避免高危行为', '早期治疗']
  },
  {
    id: 'gonorrhea',
    name: '淋病检测',
    type: 'bacterial',
    testMethod: '尿液检测/拭子检测',
    detectionWindow: '2-7天',
    accuracy: '95-99%',
    cost: '100-300元',
    frequency: '每3-6个月',
    symptoms: ['尿道分泌物', '排尿疼痛', '盆腔疼痛', '无症状'],
    prevention: ['使用安全套', '定期检测', '避免高危行为', '早期治疗']
  },
  {
    id: 'chlamydia',
    name: '衣原体检测',
    type: 'bacterial',
    testMethod: '尿液检测/拭子检测',
    detectionWindow: '1-3周',
    accuracy: '95-99%',
    cost: '100-300元',
    frequency: '每3-6个月',
    symptoms: ['尿道分泌物', '排尿疼痛', '盆腔疼痛', '无症状'],
    prevention: ['使用安全套', '定期检测', '避免高危行为', '早期治疗']
  },
  {
    id: 'hepatitis_b',
    name: '乙肝检测',
    type: 'viral',
    testMethod: '血液检测',
    detectionWindow: '1-9周',
    accuracy: '99%',
    cost: '50-200元',
    frequency: '每年或根据风险',
    symptoms: ['疲劳', '食欲不振', '恶心', '黄疸', '腹痛'],
    prevention: ['疫苗接种', '使用安全套', '避免共用针具', '定期检测']
  },
  {
    id: 'hepatitis_c',
    name: '丙肝检测',
    type: 'viral',
    testMethod: '血液检测',
    detectionWindow: '2-26周',
    accuracy: '99%',
    cost: '100-300元',
    frequency: '每年或根据风险',
    symptoms: ['疲劳', '食欲不振', '恶心', '黄疸', '腹痛'],
    prevention: ['避免共用针具', '使用安全套', '定期检测', '早期治疗']
  },
  {
    id: 'hpv',
    name: 'HPV检测',
    type: 'viral',
    testMethod: '宫颈细胞学检查/HPV DNA检测',
    detectionWindow: '1-3个月',
    accuracy: '90-95%',
    cost: '200-500元',
    frequency: '每1-3年',
    symptoms: ['生殖器疣', '宫颈异常', '无症状'],
    prevention: ['HPV疫苗接种', '使用安全套', '定期筛查', '避免高危行为']
  },
  {
    id: 'herpes',
    name: '疱疹检测',
    type: 'viral',
    testMethod: '血液检测/病毒培养',
    detectionWindow: '1-4周',
    accuracy: '90-95%',
    cost: '200-400元',
    frequency: '根据症状或风险',
    symptoms: ['生殖器疱疹', '疼痛', '瘙痒', '水疱', '溃疡'],
    prevention: ['使用安全套', '避免接触', '抗病毒治疗', '定期检测']
  },
  {
    id: 'trichomoniasis',
    name: '滴虫检测',
    type: 'parasitic',
    testMethod: '阴道分泌物检测',
    detectionWindow: '1-4周',
    accuracy: '95%',
    cost: '100-200元',
    frequency: '每3-6个月',
    symptoms: ['阴道分泌物异常', '瘙痒', '排尿疼痛', '无症状'],
    prevention: ['使用安全套', '定期检测', '避免高危行为', '早期治疗']
  },
  {
    id: 'mycoplasma',
    name: '支原体检测',
    type: 'bacterial',
    testMethod: '尿液检测/拭子检测',
    detectionWindow: '1-3周',
    accuracy: '90-95%',
    cost: '150-300元',
    frequency: '每3-6个月',
    symptoms: ['尿道炎', '盆腔炎', '无症状'],
    prevention: ['使用安全套', '定期检测', '避免高危行为', '早期治疗']
  }
];

export default function AgreementsList() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(
    null
  );
  const [party1Signed, setParty1Signed] = useState<boolean>(false);
  const [party2Signed, setParty2Signed] = useState<boolean>(false);
  const [showDigitalSignature, setShowDigitalSignature] = useState<
    false | "party1" | "party2"
  >(false);
  const [signatureData, setSignatureData] = useState<{
    party1?: string;
    party2?: string;
  }>({});
  const [audioData, setAudioData] = useState<{
    party1?: string;
    party2?: string;
  }>({});
  const [isRecording, setIsRecording] = useState<{
    party1: boolean;
    party2: boolean;
  }>({ party1: false, party2: false });
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSTIDetails, setShowSTIDetails] = useState(false);

  // 控制body滚动
  const toggleBodyScroll = (disable: boolean) => {
    if (disable) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  };

  // 组件卸载时恢复body滚动
  useEffect(() => {
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  // 处理打印功能
  const handlePrint = () => {
    if (!selectedAgreement) return;

    try {
      // 创建打印样式
      const style = document.createElement("style");
      style.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .btn, button, .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
        }
      `;
      document.head.appendChild(style);

      // 添加打印内容容器
      const printContainer = document.createElement("div");
      printContainer.className = "print-content";
      printContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-size: 24px; margin-bottom: 10px;">${
            selectedAgreement.agreementTitle
          }</h1>
        </div>
        <div style="margin-bottom: 20px;">
          <div style="margin-bottom: 10px;">
            <p>日期: ${selectedAgreement.date}</p>
            <p>参与方1: ${selectedAgreement.party1Name}</p>
            <p>身份证号: ${selectedAgreement.party1ID}</p>
            <p>参与方2: ${selectedAgreement.party2Name}</p>
            <p>身份证号: ${selectedAgreement.party2ID}</p>
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; margin-bottom: 10px;">同意详情</h3>
          <p style="white-space: pre-line;">${
            selectedAgreement.consentDetails
          }</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; margin-bottom: 10px;">安全措施</h3>
          <ul>
            ${selectedAgreement.safetyMeasures
              .map((measure) => `<li>${measure}</li>`)
              .join("")}
          </ul>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; margin-bottom: 10px;">隐私条款</h3>
          <p style="white-space: pre-line;">${
            selectedAgreement.privacyTerms
          }</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 18px; margin-bottom: 10px;">撤回同意条款</h3>
          <p style="white-space: pre-line;">${
            selectedAgreement.revocationTerms
          }</p>
        </div>
        ${
          selectedAgreement.additionalTerms
            ? `
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 18px; margin-bottom: 10px;">额外条款</h3>
              <p style="white-space: pre-line;">${selectedAgreement.additionalTerms}</p>
            </div>
          `
            : ""
        }
        ${
          party1Signed || party2Signed
            ? `
            <div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
              <h3 style="text-align: center; margin-bottom: 15px;">数字签名确认</h3>
              ${
                party1Signed && selectedAgreement.party1SignedAt
                  ? `
                  <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                    <h4 style="margin-bottom: 10px;">${selectedAgreement.party1Name} 的签署确认</h4>
                    <p>签署时间: ${new Date(
                      selectedAgreement.party1SignedAt
                    ).toLocaleString("zh-CN")}</p>
                    ${(selectedAgreement as any).party1Signature ? '<p>✓ 包含手写签名</p>' : ''}
                    ${(selectedAgreement as any).party1Audio ? '<p>✓ 包含语音确认</p>' : ''}
                  </div>
                `
                  : ""
              }
              ${
                party2Signed && selectedAgreement.party2SignedAt
                  ? `
                  <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                    <h4 style="margin-bottom: 10px;">${selectedAgreement.party2Name} 的签署确认</h4>
                    <p>签署时间: ${new Date(
                      selectedAgreement.party2SignedAt
                    ).toLocaleString("zh-CN")}</p>
                    ${(selectedAgreement as any).party2Signature ? '<p>✓ 包含手写签名</p>' : ''}
                    ${(selectedAgreement as any).party2Audio ? '<p>✓ 包含语音确认</p>' : ''}
                  </div>
                `
                  : ""
              }
            </div>
          `
            : ""
        }
      `;

      document.body.appendChild(printContainer);

      // 调用打印
      window.print();

      // 清理
      setTimeout(() => {
        document.body.removeChild(printContainer);
        document.head.removeChild(style);
      }, 1000);
    } catch (error) {
      console.error("打印错误:", error);
      alert("打印文档时发生错误，请稍后再试。");
    }
  };

  // 导出打印版本功能
  const handleExportPrintable = () => {
    if (!selectedAgreement) return;

    try {
      // 显示加载状态
      const loadingEl = document.createElement("div");
      loadingEl.style.position = "fixed";
      loadingEl.style.top = "0";
      loadingEl.style.left = "0";
      loadingEl.style.width = "100%";
      loadingEl.style.height = "100%";
      loadingEl.style.backgroundColor = "rgba(0,0,0,0.5)";
      loadingEl.style.display = "flex";
      loadingEl.style.alignItems = "center";
      loadingEl.style.justifyContent = "center";
      loadingEl.style.zIndex = "9999";

      const loadingBox = document.createElement("div");
      loadingBox.style.backgroundColor = "white";
      loadingBox.style.padding = "2rem";
      loadingBox.style.borderRadius = "0.5rem";
      loadingBox.style.textAlign = "center";
      loadingBox.innerHTML = "正在生成文档...";

      loadingEl.appendChild(loadingBox);
      document.body.appendChild(loadingEl);

      // 使用setTimeout来允许加载状态显示
      setTimeout(() => {
        try {
          // 创建临时容器用于生成图像
          const container = document.createElement("div");
          container.style.position = "absolute";
          container.style.left = "-9999px";
          container.style.top = "0";
          container.style.width = "800px"; // 设置宽度以确保布局正确
          container.style.fontFamily = "Arial, 'Microsoft YaHei', sans-serif"; // 确保使用支持中文的字体
          container.style.backgroundColor = "#ffffff"; // 确保背景为白色

          // 使用明确的RGB颜色值
          const textColor = "rgb(0, 0, 0)";
          const bgColor = "rgb(249, 249, 249)";
          const borderColor = "rgb(238, 238, 238)";

          // 添加内容到临时容器
          container.innerHTML = `
            <div style="padding: 20px; font-family: Arial, 'Microsoft YaHei', sans-serif;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 24px; font-weight: bold; color: ${textColor};">${
            selectedAgreement.agreementTitle
          } - ${selectedAgreement.date}</h1>
              </div>
              
              <div style="margin-bottom: 30px; color: ${textColor};">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px; width: 25%; color: rgb(85, 85, 85);">日期:</td>
                    <td style="padding: 8px; font-weight: 500;">${
                      selectedAgreement.date
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; width: 25%; color: rgb(85, 85, 85);">参与方1:</td>
                    <td style="padding: 8px; font-weight: 500;">${
                      selectedAgreement.party1Name
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; width: 25%; color: rgb(85, 85, 85);">身份证号:</td>
                    <td style="padding: 8px;">${selectedAgreement.party1ID}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; width: 25%; color: rgb(85, 85, 85);">参与方2:</td>
                    <td style="padding: 8px; font-weight: 500;">${
                      selectedAgreement.party2Name
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; width: 25%; color: rgb(85, 85, 85);">身份证号:</td>
                    <td style="padding: 8px;">${selectedAgreement.party2ID}</td>
                  </tr>
                </table>
              </div>
              
              <div style="margin-top: 40px;">
                <h2 style="font-size: 18px; font-weight: bold; color: ${textColor}; padding-bottom: 10px; border-bottom: 1px solid ${borderColor}; margin-bottom: 15px;">同意详情</h2>
                <div style="background-color: ${bgColor}; padding: 15px; border-radius: 5px; color: ${textColor}; white-space: pre-line; margin-bottom: 30px;">${
            selectedAgreement.consentDetails
          }</div>
              </div>
              
              <div style="margin-top: 30px;">
                <h2 style="font-size: 18px; font-weight: bold; color: ${textColor}; padding-bottom: 10px; border-bottom: 1px solid ${borderColor}; margin-bottom: 15px;">安全措施</h2>
                <ul style="background-color: ${bgColor}; padding: 15px 15px 15px 35px; border-radius: 5px; margin-bottom: 30px;">
                  ${selectedAgreement.safetyMeasures
                    .map(
                      (measure) =>
                        `<li style="margin: 8px 0; color: ${textColor};">${measure}</li>`
                    )
                    .join("")}
                </ul>
              </div>
              
              <div style="margin-top: 30px;">
                <h2 style="font-size: 18px; font-weight: bold; color: ${textColor}; padding-bottom: 10px; border-bottom: 1px solid ${borderColor}; margin-bottom: 15px;">隐私条款</h2>
                <div style="background-color: ${bgColor}; padding: 15px; border-radius: 5px; color: ${textColor}; white-space: pre-line; margin-bottom: 30px;">${
            selectedAgreement.privacyTerms
          }</div>
              </div>
              
              <div style="margin-top: 30px;">
                <h2 style="font-size: 18px; font-weight: bold; color: ${textColor}; padding-bottom: 10px; border-bottom: 1px solid ${borderColor}; margin-bottom: 15px;">撤回同意条款</h2>
                <div style="background-color: ${bgColor}; padding: 15px; border-radius: 5px; color: ${textColor}; white-space: pre-line; margin-bottom: 30px;">${
            selectedAgreement.revocationTerms
          }</div>
              </div>
              
              ${
                selectedAgreement.additionalTerms
                  ? `
                <div style="margin-top: 30px;">
                  <h2 style="font-size: 18px; font-weight: bold; color: ${textColor}; padding-bottom: 10px; border-bottom: 1px solid ${borderColor}; margin-bottom: 15px;">额外条款</h2>
                  <div style="background-color: ${bgColor}; padding: 15px; border-radius: 5px; color: ${textColor}; white-space: pre-line; margin-bottom: 30px;">${selectedAgreement.additionalTerms}</div>
                </div>
              `
                  : ""
              }
              
              ${
                party1Signed || party2Signed
                  ? `
                <div style="margin-top: 50px; page-break-inside: avoid;">
                  <h2 style="font-size: 18px; font-weight: bold; color: ${textColor}; text-align: center; margin-bottom: 20px;">数字签名确认</h2>
                  <div style="background-color: ${bgColor}; padding: 20px; border-radius: 5px;">
                    ${
                      party1Signed && selectedAgreement.party1SignedAt
                        ? `
                      <div style="margin-bottom: 20px; padding: 15px; background-color: white; border-radius: 5px; border-left: 4px solid #3b82f6;">
                        <h3 style="font-size: 16px; font-weight: bold; color: ${textColor}; margin-bottom: 10px;">${selectedAgreement.party1Name} 的签署确认</h3>
                        <p style="color: rgb(85, 85, 85); margin-bottom: 5px;">签署时间: ${new Date(
                          selectedAgreement.party1SignedAt
                        ).toLocaleString("zh-CN")}</p>
                        ${(selectedAgreement as any).party1Signature ? '<p style="color: #059669; margin-bottom: 5px;">✓ 包含手写签名</p>' : ''}
                        ${(selectedAgreement as any).party1Audio ? '<p style="color: #059669; margin-bottom: 5px;">✓ 包含语音确认</p>' : ''}
                      </div>
                    `
                        : ""
                    }
                    ${
                      party2Signed && selectedAgreement.party2SignedAt
                        ? `
                      <div style="margin-bottom: 20px; padding: 15px; background-color: white; border-radius: 5px; border-left: 4px solid #8b5cf6;">
                        <h3 style="font-size: 16px; font-weight: bold; color: ${textColor}; margin-bottom: 10px;">${selectedAgreement.party2Name} 的签署确认</h3>
                        <p style="color: rgb(85, 85, 85); margin-bottom: 5px;">签署时间: ${new Date(
                          selectedAgreement.party2SignedAt
                        ).toLocaleString("zh-CN")}</p>
                        ${(selectedAgreement as any).party2Signature ? '<p style="color: #059669; margin-bottom: 5px;">✓ 包含手写签名</p>' : ''}
                        ${(selectedAgreement as any).party2Audio ? '<p style="color: #059669; margin-bottom: 5px;">✓ 包含语音确认</p>' : ''}
                      </div>
                    `
                        : ""
                    }
                  </div>
                </div>
              `
                  : ""
              }
            </div>
          `;

          document.body.appendChild(container);

          // 使用html2canvas捕获容器内容
          const html2canvasOptions = {
            scale: 2, // 提高清晰度
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            ignoreElements: (element: Element) => {
              // 跳过可能包含不支持颜色格式的元素
              if (typeof element.className === "string") {
                return (
                  element.className.includes("loading") ||
                  element.className.includes("badge")
                );
              }
              return false;
            },
          };

          html2canvas(container, html2canvasOptions)
            .then((canvas) => {
              // 创建下载链接
              const link = document.createElement("a");
              // 使用更高质量设置转换为PNG
              link.href = canvas.toDataURL("image/png", 1.0);
              // 设置文件名
              link.download = `${selectedAgreement.agreementTitle}.png`;
              document.body.appendChild(link);
              // 触发下载
              link.click();

              // 清理DOM
              document.body.removeChild(link);
              document.body.removeChild(container);
              document.body.removeChild(loadingEl);
            })
            .catch((error) => {
              console.error("HTML2Canvas错误:", error);
              document.body.removeChild(container);
              document.body.removeChild(loadingEl);
              alert("导出文档时发生错误，请稍后再试。");
            });
        } catch (error) {
          console.error("导出文档错误:", error);
          document.body.removeChild(loadingEl);
          alert("导出文档时发生错误，请稍后再试。");
        }
      }, 100);
    } catch (error) {
      console.error("导出文档错误:", error);
      alert("导出文档时发生错误，请稍后再试。");
    }
  };

  // 使用原生JavaScript读取URL参数
  useEffect(() => {
    // 直接从window.location.search获取参数
    function getQueryParam(name: string) {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
      }
      return null;
    }

    const fetchData = () => {
      try {
        const storedAgreements = localStorage.getItem(STORAGE_KEY);
        if (storedAgreements) {
          const parsed = JSON.parse(storedAgreements);
          setAgreements(parsed);

          // 检查URL中是否有view参数
          const viewId = getQueryParam("view");
          if (viewId) {
            const foundAgreement = parsed.find((a: any) => a.id === viewId);
            if (foundAgreement) {
              setSelectedAgreement(foundAgreement);
              setParty1Signed(!!foundAgreement.party1Signed);
              setParty2Signed(!!foundAgreement.party2Signed);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching agreements:", error);
      } finally {
        setLoading(false);
      }
    };

    // 只在客户端运行
    if (typeof window !== "undefined") {
      fetchData();
    }
  }, []);

  // 删除协议
  const handleDelete = (id: string) => {
    if (window.confirm("确定要删除此协议吗？删除后无法恢复。")) {
      try {
        const filteredAgreements = agreements.filter(
          (agreement) => agreement.id !== id
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAgreements));
        setAgreements(filteredAgreements);

        // 如果正在查看这个协议，关闭查看
        if (selectedAgreement?.id === id) {
          setSelectedAgreement(null);
          // 更新URL，移除view参数
          window.history.replaceState(null, "", "/agreements");
        }
      } catch (error) {
        console.error("Error deleting agreement:", error);
      }
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  // 处理协议签署
  const handleSign = (party: "party1" | "party2") => {
    if (!selectedAgreement) return;

    try {
      const storedAgreements = localStorage.getItem(STORAGE_KEY);
      if (storedAgreements) {
        const agreements = JSON.parse(storedAgreements);
        const updatedAgreements = agreements.map((a: any) => {
          if (a.id === selectedAgreement.id) {
            if (party === "party1") {
              setParty1Signed(true);
              return {
                ...a,
                party1Signed: true,
                party1SignedAt: new Date().toISOString(),
                party1Signature: signatureData.party1,
                party1Audio: audioData.party1,
              };
            } else {
              setParty2Signed(true);
              return {
                ...a,
                party2Signed: true,
                party2SignedAt: new Date().toISOString(),
                party2Signature: signatureData.party2,
                party2Audio: audioData.party2,
              };
            }
          }
          return a;
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAgreements));

        // 更新本地状态
        const updatedAgreement = updatedAgreements.find(
          (a: any) => a.id === selectedAgreement.id
        );
        if (updatedAgreement) {
          setSelectedAgreement(updatedAgreement);
          setAgreements(updatedAgreements);
        }
      }
    } catch (error) {
      console.error("Error signing agreement:", error);
    }
  };

  // 开始录音
  const startRecording = async (party: "party1" | "party2") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioData(prev => ({
          ...prev,
          [party]: audioUrl
        }));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(prev => ({ ...prev, [party]: true }));
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("无法访问麦克风，请检查权限设置");
    }
  };

  // 停止录音
  const stopRecording = (party: "party1" | "party2") => {
    if (mediaRecorder && isRecording[party]) {
      mediaRecorder.stop();
      setIsRecording(prev => ({ ...prev, [party]: false }));
      setMediaRecorder(null);
    }
  };

  // 清除录音
  const clearRecording = (party: "party1" | "party2") => {
    setAudioData(prev => {
      const newData = { ...prev };
      if (newData[party]) {
        URL.revokeObjectURL(newData[party]!);
        delete newData[party];
      }
      return newData;
    });
  };

  // 清除签名
  const clearSignature = (party: "party1" | "party2") => {
    setSignatureData(prev => {
      const newData = { ...prev };
      delete newData[party];
      return newData;
    });
  };

  // 签名板相关函数
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getMousePos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // 触摸事件支持
  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getTouchPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getTouchPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const saveSignature = (party: "party1" | "party2") => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const signatureDataUrl = canvas.toDataURL('image/png');
    setSignatureData(prev => ({
      ...prev,
      [party]: signatureDataUrl
    }));
  };

  // 初始化签名板
  const initSignaturePad = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置Canvas尺寸
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    // 缩放上下文以匹配设备像素比
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // 设置绘制样式
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  // 当弹窗打开时初始化签名板
  useEffect(() => {
    if (showDigitalSignature !== false) {
      setTimeout(initSignaturePad, 100);
    }
  }, [showDigitalSignature]);

  // 关闭选中的协议
  const closeSelectedAgreement = () => {
    setSelectedAgreement(null);
    // 更新URL，移除view参数
    window.history.replaceState(null, "", "/agreements");
  };

  // 选择协议查看
  const handleViewAgreement = (id: string) => {
    const foundAgreement = agreements.find((a) => a.id === id);
    if (foundAgreement) {
      setSelectedAgreement(foundAgreement);
      setParty1Signed(!!foundAgreement.party1Signed);
      setParty2Signed(!!foundAgreement.party2Signed);

      // 更新URL，但不导航
      window.history.replaceState(null, "", `/agreements?view=${id}`);
    }
  };

  const handleOpenDigitalSignature = (party: 'party1' | 'party2') => {
    setShowDigitalSignature(party);
    toggleBodyScroll(true);
  };

  // 如果正在查看某个协议，显示该协议详情
  if (selectedAgreement) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="modern-card p-8 mb-8 sparkle">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold gradient-text animate-bounce-in">
              {selectedAgreement.agreementTitle}
            </h1>
            <div className="flex gap-3 flex-wrap">
              <button onClick={handlePrint} className="btn btn-outline border-2 border-purple-500 text-purple-600 hover:bg-purple-50 transition-all duration-300 font-semibold">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                打印
              </button>
              <button onClick={handleExportPrintable} className="btn btn-outline border-2 border-pink-500 text-pink-600 hover:bg-pink-50 transition-all duration-300 font-semibold">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                导出打印版本
              </button>
              <button
                onClick={() => {
                  setShowSTIDetails(true);
                  toggleBodyScroll(true);
                }}
                className="btn btn-outline border-2 border-amber-500 text-amber-600 hover:bg-amber-50 transition-all duration-300 font-semibold"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                检测详情
              </button>
              <button
                onClick={closeSelectedAgreement}
                className="btn btn-outline border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                返回列表
              </button>
            </div>
          </div>
        </div>

        <div className="modern-card p-8 mb-8 wave-effect">
          <h2 className="text-2xl font-bold mb-6 gradient-text animate-rotate-in">基本信息</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="glass-effect p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-semibold text-gray-600">日期</p>
              </div>
              <p className="text-lg font-medium">{selectedAgreement.date}</p>
            </div>
            <div className="glass-effect p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-gray-600">创建时间</p>
              </div>
              <p className="text-lg font-medium">
                {new Date(selectedAgreement.createdAt).toLocaleString("zh-CN")}
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-6 gradient-text animate-rotate-in">参与方信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="modern-card p-6 bg-gradient-to-br from-purple-50 to-pink-50 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg">{selectedAgreement.party1Name}</h4>
                {party1Signed ? (
                  <div className="badge badge-success gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    已签署
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenDigitalSignature("party1")}
                    className="btn btn-sm modern-button"
                  >
                    点击签署
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                身份证号: {selectedAgreement.party1ID}
              </p>
              {party1Signed && (selectedAgreement as any).party1Signature && (
                <div className="mt-3 p-3 bg-white rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-2">手写签名:</p>
                  <img 
                    src={(selectedAgreement as any).party1Signature} 
                    alt="签名" 
                    className="max-w-full h-16 object-contain border rounded"
                  />
                </div>
              )}
              {party1Signed && (selectedAgreement as any).party1Audio && (
                <div className="mt-3 p-3 bg-white rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-2">语音确认:</p>
                  <audio controls className="w-full">
                    <source src={(selectedAgreement as any).party1Audio} type="audio/wav" />
                    您的浏览器不支持音频播放。
                  </audio>
                </div>
              )}
              {selectedAgreement.party1TestResults && selectedAgreement.party1TestResults.length > 0 && (
                <div className="mt-3 p-3 bg-white rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-2">性病检测结果:</p>
                  <div className="space-y-2">
                    {selectedAgreement.party1TestResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{result.testName}</p>
                          <p className="text-xs text-gray-500">{result.testDate}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.result === 'negative' ? 'bg-green-100 text-green-800' :
                          result.result === 'positive' ? 'bg-red-100 text-red-800' :
                          result.result === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.result === 'negative' ? '阴性' :
                           result.result === 'positive' ? '阳性' :
                           result.result === 'pending' ? '待定' : '不确定'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modern-card p-6 bg-gradient-to-br from-pink-50 to-amber-50 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg">{selectedAgreement.party2Name}</h4>
                {party2Signed ? (
                  <div className="badge badge-success gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    已签署
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenDigitalSignature("party2")}
                    className="btn btn-sm modern-button"
                  >
                    点击签署
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                身份证号: {selectedAgreement.party2ID}
              </p>
              {party2Signed && (selectedAgreement as any).party2Signature && (
                <div className="mt-3 p-3 bg-white rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-2">手写签名:</p>
                  <img 
                    src={(selectedAgreement as any).party2Signature} 
                    alt="签名" 
                    className="max-w-full h-16 object-contain border rounded"
                  />
                </div>
              )}
              {party2Signed && (selectedAgreement as any).party2Audio && (
                <div className="mt-3 p-3 bg-white rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-2">语音确认:</p>
                  <audio controls className="w-full">
                    <source src={(selectedAgreement as any).party2Audio} type="audio/wav" />
                    您的浏览器不支持音频播放。
                  </audio>
                </div>
              )}
              {selectedAgreement.party2TestResults && selectedAgreement.party2TestResults.length > 0 && (
                <div className="mt-3 p-3 bg-white rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-2">性病检测结果:</p>
                  <div className="space-y-2">
                    {selectedAgreement.party2TestResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{result.testName}</p>
                          <p className="text-xs text-gray-500">{result.testDate}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.result === 'negative' ? 'bg-green-100 text-green-800' :
                          result.result === 'positive' ? 'bg-red-100 text-red-800' :
                          result.result === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.result === 'negative' ? '阴性' :
                           result.result === 'positive' ? '阳性' :
                           result.result === 'pending' ? '待定' : '不确定'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-effect p-6 rounded-xl bg-purple-50 border border-purple-200">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">重要提示</h4>
                <p className="text-purple-700">
                  建议使用"打印"或"导出打印版本"功能后，由双方在纸质文档上手写签名确认
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="modern-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 gradient-text">协议内容</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4 gradient-text">同意详情</h3>
              <div className="glass-effect p-6 rounded-xl">
                <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {selectedAgreement.consentDetails}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 gradient-text">安全措施</h3>
              <div className="glass-effect p-6 rounded-xl">
                <ul className="space-y-3">
                  {selectedAgreement.safetyMeasures.map((measure, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700">{measure}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 gradient-text">隐私条款</h3>
              <div className="glass-effect p-6 rounded-xl">
                <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {selectedAgreement.privacyTerms}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 gradient-text">撤回同意条款</h3>
              <div className="glass-effect p-6 rounded-xl">
                <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {selectedAgreement.revocationTerms}
                </p>
              </div>
            </div>

            {selectedAgreement.additionalTerms && (
              <div>
                <h3 className="text-xl font-bold mb-4 gradient-text">额外条款</h3>
                <div className="glass-effect p-6 rounded-xl">
                  <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {selectedAgreement.additionalTerms}
                  </p>
                </div>
              </div>
            )}

            {selectedAgreement.stiTestingAgreement && (
              <div>
                <h3 className="text-xl font-bold mb-4 gradient-text">性病检测协议</h3>
                <div className="glass-effect p-6 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">检测要求</h4>
                      <ul className="space-y-2">
                        {selectedAgreement.stiTestingAgreement.requiredTests.map((testId, index) => {
                          const test = STI_TESTS.find(t => t.id === testId);
                          return test ? (
                            <li key={index} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                test.type === 'viral' ? 'bg-red-500' :
                                test.type === 'bacterial' ? 'bg-blue-500' :
                                test.type === 'parasitic' ? 'bg-green-500' :
                                'bg-yellow-500'
                              }`}></div>
                              <span className="text-gray-700">{test.name}</span>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">检测安排</h4>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <span className="font-medium">检测频率:</span> {selectedAgreement.stiTestingAgreement.testingFrequency}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">结果共享:</span> {selectedAgreement.stiTestingAgreement.sharingResults ? '是' : '否'}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">复检要求:</span> {selectedAgreement.stiTestingAgreement.retestRequired ? '是' : '否'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 数字签名弹窗 */}
        {showDigitalSignature !== false && (
          <div className="modal-overlay animate-fade-in" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDigitalSignature(false);
              toggleBodyScroll(false);
            }
          }}>
            <div className="modal-content p-8 max-w-2xl w-full">
              <h3 className="text-2xl font-bold mb-6 text-center gradient-text">数字签名确认</h3>

              <div className="glass-effect p-6 rounded-xl mb-6">
                <p className="text-gray-700 mb-4">
                  您正在为以下协议进行数字签名:
                </p>
                <p className="font-bold text-lg text-blue-600">
                  {selectedAgreement.agreementTitle}
                </p>
              </div>

              <div className="glass-effect p-6 rounded-xl mb-6">
                <p className="text-gray-700 mb-2">
                  <strong>签名方:</strong>
                </p>
                <p className="font-bold text-lg text-purple-600">
                  {showDigitalSignature === "party1"
                    ? selectedAgreement.party1Name
                    : selectedAgreement.party2Name}
                </p>
              </div>

              {/* 手写签名板 */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-700">手写签名</h4>
                <div className="signature-pad">
                  <canvas
                    ref={signatureCanvasRef}
                    width={400}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawingTouch}
                    onTouchMove={drawTouch}
                    onTouchEnd={stopDrawingTouch}
                    className="w-full h-48"
                    style={{ touchAction: 'none' }}
                  />
                </div>
                <div className="signature-controls">
                  <button
                    onClick={clearCanvas}
                    className="signature-clear"
                  >
                    清除签名
                  </button>
                  <button
                    onClick={() => saveSignature(showDigitalSignature)}
                    className="modern-button btn btn-sm"
                  >
                    保存签名
                  </button>
                </div>
                {signatureData[showDigitalSignature] && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-sm">✓ 签名已保存</p>
                  </div>
                )}
              </div>

              {/* 语音录制 */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 text-gray-700">语音确认</h4>
                <div className="glass-effect p-4 rounded-xl">
                  {isRecording[showDigitalSignature] ? (
                    <div className="recording-indicator">
                      <div className="recording-dot"></div>
                      <span>正在录音中...</span>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => startRecording(showDigitalSignature)}
                        className="btn btn-sm btn-outline border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                        开始录音
                      </button>
                      {audioData[showDigitalSignature] && (
                        <>
                          <button
                            onClick={() => clearRecording(showDigitalSignature)}
                            className="btn btn-sm btn-outline border-gray-500 text-gray-600 hover:bg-gray-50"
                          >
                            清除录音
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  
                  {isRecording[showDigitalSignature] && (
                    <button
                      onClick={() => stopRecording(showDigitalSignature)}
                      className="btn btn-sm btn-outline border-gray-500 text-gray-600 hover:bg-gray-50 mt-3"
                    >
                      停止录音
                    </button>
                  )}

                  {audioData[showDigitalSignature] && (
                    <div className="audio-player mt-3">
                      <p className="text-sm text-gray-600 mb-2">录音已保存</p>
                      <div className="audio-controls">
                        <audio controls className="flex-1">
                          <source src={audioData[showDigitalSignature]} type="audio/wav" />
                          您的浏览器不支持音频播放。
                        </audio>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-control mb-8">
                <label className="flex items-center gap-3 cursor-pointer justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <input type="checkbox" className="checkbox checkbox-primary" required />
                  <span className="font-medium">我确认自愿签署此协议，并了解其法律效力</span>
                </label>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowDigitalSignature(false);
                    toggleBodyScroll(false);
                  }}
                  className="btn btn-outline border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 font-semibold px-6"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    handleSign(showDigitalSignature);
                    setShowDigitalSignature(false);
                    toggleBodyScroll(false);
                  }}
                  className="modern-button btn px-6 font-semibold"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  确认签署
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 性病检测详情弹窗 */}
        {showSTIDetails && (
          <div className="modal-overlay animate-fade-in" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSTIDetails(false);
              toggleBodyScroll(false);
            }
          }}>
            <div className="modal-content p-8 max-w-6xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold gradient-text">性病检测详情</h3>
                <button
                  onClick={() => {
                    setShowSTIDetails(false);
                    toggleBodyScroll(false);
                  }}
                  className="btn btn-outline border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 检测类型列表 */}
                <div>
                  <h4 className="text-xl font-bold mb-4 gradient-text">常见性病检测类型</h4>
                  <div className="space-y-4">
                    {STI_TESTS.map((test) => (
                      <div key={test.id} className="modern-card p-4 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-bold text-lg text-gray-800">{test.name}</h5>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            test.type === 'viral' ? 'bg-red-100 text-red-800' :
                            test.type === 'bacterial' ? 'bg-blue-100 text-blue-800' :
                            test.type === 'parasitic' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {test.type === 'viral' ? '病毒性' :
                             test.type === 'bacterial' ? '细菌性' :
                             test.type === 'parasitic' ? '寄生虫' : '真菌性'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-600">检测方法:</p>
                            <p className="text-gray-700">{test.testMethod}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">检测窗口期:</p>
                            <p className="text-gray-700">{test.detectionWindow}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">准确率:</p>
                            <p className="text-gray-700">{test.accuracy}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">费用:</p>
                            <p className="text-gray-700">{test.cost}</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="font-medium text-gray-600 text-sm">常见症状:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {test.symptoms.map((symptom, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="font-medium text-gray-600 text-sm">预防措施:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {test.prevention.map((prevention, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                {prevention}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 检测指南和建议 */}
                <div>
                  <h4 className="text-xl font-bold mb-4 gradient-text">检测指南</h4>
                  
                  <div className="space-y-6">
                    <div className="modern-card p-6">
                      <h5 className="font-bold text-lg mb-3 text-purple-600">检测前准备</h5>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>避免性行为24-48小时（根据检测类型）</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>避免使用阴道冲洗或润滑剂</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>保持充足睡眠，避免过度疲劳</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>携带身份证件和医保卡</span>
                        </li>
                      </ul>
                    </div>

                    <div className="modern-card p-6">
                      <h5 className="font-bold text-lg mb-3 text-pink-600">检测频率建议</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <span className="font-medium">高风险人群</span>
                          <span className="text-sm text-gray-600">每1-3个月</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                          <span className="font-medium">中等风险人群</span>
                          <span className="text-sm text-gray-600">每3-6个月</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="font-medium">低风险人群</span>
                          <span className="text-sm text-gray-600">每6-12个月</span>
                        </div>
                      </div>
                    </div>

                    <div className="modern-card p-6">
                      <h5 className="font-bold text-lg mb-3 text-purple-600">检测机构推荐</h5>
                      <div className="space-y-3">
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <h6 className="font-semibold">公立医院</h6>
                          <p className="text-sm text-gray-600">费用较低，结果可靠，需要预约</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <h6 className="font-semibold">私立医院</h6>
                          <p className="text-sm text-gray-600">服务较好，费用较高，预约方便</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <h6 className="font-semibold">疾控中心</h6>
                          <p className="text-sm text-gray-600">免费检测，专业服务，隐私保护</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <h6 className="font-semibold">在线检测</h6>
                          <p className="text-sm text-gray-600">方便快捷，隐私保护，需要邮寄样本</p>
                        </div>
                      </div>
                    </div>

                    <div className="modern-card p-6">
                      <h5 className="font-bold text-lg mb-3 text-amber-600">重要提醒</h5>
                      <div className="space-y-2 text-gray-700">
                        <p className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>检测结果需要等待，请耐心等待</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>如有阳性结果，请及时就医治疗</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>定期检测是预防性病的重要措施</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>保护隐私，选择可信的检测机构</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="modern-card p-8 mb-8 sparkle">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold gradient-text animate-bounce-in">我的协议</h1>
          <Link href="/create" className="modern-button btn px-8 font-semibold">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            创建新协议
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="modern-card p-8 text-center">
            <span className="loading loading-spinner loading-lg text-blue-500"></span>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      ) : agreements.length === 0 ? (
        <div className="modern-card p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-4 gradient-text">暂无协议</h3>
          <p className="mb-8 text-gray-600 text-lg">您尚未创建任何性同意协议</p>
          <Link href="/create" className="modern-button btn px-8 font-semibold">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            立即创建
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agreements.map((agreement, index) => (
            <div key={agreement.id} className="modern-card p-6 hover:shadow-lg transition-all duration-300 group animate-scale-in wave-effect" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {agreement.agreementTitle}
                </h3>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleViewAgreement(agreement.id)}
                    className="btn btn-sm btn-outline border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(agreement.id)}
                    className="btn btn-sm btn-outline border-red-500 text-red-600 hover:bg-red-50 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">日期: {agreement.date}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">{agreement.party1Name} 和 {agreement.party2Name}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>创建于 {formatDate(agreement.createdAt)}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewAgreement(agreement.id)}
                  className="w-full modern-button btn btn-sm font-semibold"
                >
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link href="/" className="btn btn-outline border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 font-semibold px-8">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          返回首页
        </Link>
      </div>
    </div>
  );
}
