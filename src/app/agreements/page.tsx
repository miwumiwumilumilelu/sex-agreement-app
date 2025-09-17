"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";

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
}

// 本地存储键
const STORAGE_KEY = "consent-agreements";

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
              <h3 style="text-align: center; margin-bottom: 15px;">签名</h3>
              ${
                party1Signed && selectedAgreement.party1SignedAt
                  ? `
                  <p>${selectedAgreement.party1Name} 已签署</p>
                  <p>签署时间: ${new Date(
                    selectedAgreement.party1SignedAt
                  ).toLocaleString("zh-CN")}</p>
                `
                  : ""
              }
              ${
                party2Signed && selectedAgreement.party2SignedAt
                  ? `
                  <p>${selectedAgreement.party2Name} 已签署</p>
                  <p>签署时间: ${new Date(
                    selectedAgreement.party2SignedAt
                  ).toLocaleString("zh-CN")}</p>
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
                  <h2 style="font-size: 18px; font-weight: bold; color: ${textColor}; text-align: center; margin-bottom: 20px;">签名</h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    ${
                      party1Signed && selectedAgreement.party1SignedAt
                        ? `
                      <tr>
                        <td style="padding: 10px; border-top: 1px solid ${borderColor}; width: 30%; color: rgb(85, 85, 85);">参与方1:</td>
                        <td style="padding: 10px; border-top: 1px solid ${borderColor}; font-weight: 500;">${
                            selectedAgreement.party1Name
                          } 已签署</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; border-bottom: 1px solid ${borderColor}; color: rgb(85, 85, 85);">签署时间:</td>
                        <td style="padding: 10px; border-bottom: 1px solid ${borderColor};">${new Date(
                            selectedAgreement.party1SignedAt
                          ).toLocaleString("zh-CN")}</td>
                      </tr>
                    `
                        : ""
                    }
                    ${
                      party2Signed && selectedAgreement.party2SignedAt
                        ? `
                      <tr>
                        <td style="padding: 10px; border-top: 1px solid ${borderColor}; width: 30%; color: rgb(85, 85, 85);">参与方2:</td>
                        <td style="padding: 10px; border-top: 1px solid ${borderColor}; font-weight: 500;">${
                            selectedAgreement.party2Name
                          } 已签署</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; border-bottom: 1px solid ${borderColor}; color: rgb(85, 85, 85);">签署时间:</td>
                        <td style="padding: 10px; border-bottom: 1px solid ${borderColor};">${new Date(
                            selectedAgreement.party2SignedAt
                          ).toLocaleString("zh-CN")}</td>
                      </tr>
                    `
                        : ""
                    }
                  </table>
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
              };
            } else {
              setParty2Signed(true);
              return {
                ...a,
                party2Signed: true,
                party2SignedAt: new Date().toISOString(),
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

  // 如果正在查看某个协议，显示该协议详情
  if (selectedAgreement) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="modern-card p-8 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold gradient-text">
              {selectedAgreement.agreementTitle}
            </h1>
            <div className="flex gap-3">
              <button onClick={handlePrint} className="btn btn-outline border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-300 font-semibold">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                打印
              </button>
              <button onClick={handleExportPrintable} className="btn btn-outline border-2 border-green-500 text-green-600 hover:bg-green-50 transition-all duration-300 font-semibold">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                导出打印版本
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

        <div className="modern-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 gradient-text">基本信息</h2>

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

          <h3 className="text-xl font-bold mb-6 gradient-text">参与方信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="modern-card p-6 bg-gradient-to-br from-blue-50 to-purple-50">
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
                    onClick={() => setShowDigitalSignature("party1")}
                    className="btn btn-sm modern-button"
                  >
                    点击签署
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                身份证号: {selectedAgreement.party1ID}
              </p>
            </div>

            <div className="modern-card p-6 bg-gradient-to-br from-purple-50 to-pink-50">
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
                    onClick={() => setShowDigitalSignature("party2")}
                    className="btn btn-sm modern-button"
                  >
                    点击签署
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                身份证号: {selectedAgreement.party2ID}
              </p>
            </div>
          </div>

          <div className="glass-effect p-6 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">重要提示</h4>
                <p className="text-blue-700">
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
          </div>
        </div>

        {/* 数字签名弹窗 */}
        {showDigitalSignature !== false && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="modern-card p-8 max-w-md w-full mx-4">
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

              <div className="form-control mb-8">
                <label className="flex items-center gap-3 cursor-pointer justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <input type="checkbox" className="checkbox checkbox-primary" required />
                  <span className="font-medium">我确认自愿签署此协议，并了解其法律效力</span>
                </label>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDigitalSignature(false)}
                  className="btn btn-outline border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all duration-300 font-semibold px-6"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    handleSign(showDigitalSignature);
                    setShowDigitalSignature(false);
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
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="modern-card p-8 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold gradient-text">我的协议</h1>
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
          {agreements.map((agreement) => (
            <div key={agreement.id} className="modern-card p-6 hover:shadow-lg transition-all duration-300 group">
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
