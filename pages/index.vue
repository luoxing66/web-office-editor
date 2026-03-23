<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="flex space-between">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Web Office Editor</h1>
        <a href="https://github.com/luoxing66/web-office-editor" title="github" target="_blank">
          <svg
            aria-hidden="true"
            focusable="false"
            class="octicon octicon-mark-github"
            viewBox="0 0 24 24"
            width="32"
            height="32"
            fill="currentColor"
            display="inline-block"
            overflow="visible"
            style="vertical-align: text-bottom"
          >
            <path
              d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 1.1 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234.763.494 1.28 1.572 1.28 2.807v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943"
            ></path>
          </svg>
        </a>
      </div>

      <!-- 上传区域 -->
      <div
        class="border-2 border-dashed rounded-lg p-8 text-center mb-8 transition-colors"
        :class="
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
        "
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <div class="text-gray-500 mb-4">
          <svg
            class="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <p class="text-gray-600 mb-2">拖拽文件到此处，或</p>
        <label
          class="inline-block cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          选择文件
          <input
            type="file"
            multiple
            class="hidden"
            accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx"
            @change="handleFileSelect"
          />
        </label>
        <p class="text-sm text-gray-400 mt-2">
          仅支持 Office 文件（doc/docx/xls/xlsx/ppt/pptx），单个文件最大 5MB
        </p>
      </div>

      <!-- 上传进度 -->
      <div v-if="uploading" class="mb-6 bg-white rounded-lg p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <svg
            class="animate-spin h-5 w-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span class="text-gray-700">正在上传...</span>
        </div>
      </div>

      <!-- 提示消息 -->
      <div
        v-if="message"
        class="mb-6 rounded-lg p-4"
        :class="
          messageType === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        "
      >
        {{ message }}
      </div>

      <!-- 文件列表 -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">文件列表</h2>
        </div>

        <div v-if="files.length === 0" class="p-8 text-center text-gray-400">
          暂无文件
        </div>

        <table v-else class="w-full">
          <thead>
            <tr class="text-left text-sm text-gray-500 border-b">
              <th class="px-6 py-3 font-medium">文件名</th>
              <th class="px-6 py-3 font-medium">大小</th>
              <th class="px-6 py-3 font-medium">上传时间</th>
              <th class="px-6 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="file in files"
              :key="file.name"
              class="border-b last:border-b-0 hover:bg-gray-50"
            >
              <td class="px-6 py-4 text-gray-900">{{ file.name }}</td>
              <td class="px-6 py-4 text-gray-600 text-sm">
                {{ formatSize(file.size) }}
              </td>
              <td class="px-6 py-4 text-gray-600 text-sm">
                {{ formatDate(file.uploadedAt) }}
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  class="px-3 py-1 text-sm bg-sky-50 text-sky-700 rounded hover:bg-sky-100 transition-colors"
                  @click="openOfficeEditor(file.name, true)"
                >
                  预览
                </button>
                <button
                  class="px-3 py-1 text-sm bg-violet-50 text-violet-700 rounded hover:bg-violet-100 transition-colors"
                  @click="openOfficeEditor(file.name, false)"
                >
                  编辑
                </button>
                <a
                  :href="`/api/files/${encodeURIComponent(file.name)}`"
                  class="inline-block px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                >
                  下载
                </a>
                <button
                  class="px-3 py-1 text-sm bg-rose-50 text-rose-700 rounded hover:bg-rose-100 transition-colors"
                  @click="deleteFile(file.name)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FileInfo {
  name: string;
  size: number;
  uploadedAt: string;
}

const files = ref<FileInfo[]>([]);
const uploading = ref(false);
const isDragging = ref(false);
const message = ref("");
const messageType = ref<"success" | "error">("success");

async function fetchFiles() {
  files.value = await $fetch<FileInfo[]>("/api/files");
}

function showMessage(text: string, type: "success" | "error") {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    message.value = "";
  }, 3000);
}

async function uploadFiles(fileList: FileList | File[]) {
  const formData = new FormData();
  for (const file of fileList) {
    formData.append("file", file);
  }

  uploading.value = true;
  try {
    await $fetch("/api/files", { method: "POST", body: formData });
    showMessage("上传成功！", "success");
    await fetchFiles();
  } catch (e: any) {
    showMessage(e.data?.message || "上传失败", "error");
  } finally {
    uploading.value = false;
  }
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files?.length) {
    uploadFiles(input.files);
    input.value = "";
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false;
  if (e.dataTransfer?.files.length) {
    uploadFiles(e.dataTransfer.files);
  }
}

// 通过自定义协议调用本地 Office 编辑器插件
function openOfficeEditor(name: string, readonly: boolean = false) {
  showMessage("正在打开，请稍候...", "success");
  const a = document.createElement("a");
  const host = encodeURIComponent(new URL(location.href).origin);
  const object = encodeURIComponent(name);
  a.href =
    "office-editor://" +
    btoa(
      [
        `host=${host}`,
        `object=${object}`,
        // 可选传递，bucket = ${bucket}
        `view=${readonly ? "true" : "false"}`,
      ].join("&"),
    );
  a.click();
  a.remove();

  let isBlurred = false;
  const onBlur = () => {
    window.removeEventListener("blur", onBlur);
    isBlurred = true;
  };
  window.addEventListener("blur", onBlur);

  setTimeout(() => {
    if (isBlurred) return;
    window.removeEventListener("blur", onBlur);
    if (confirm("未检测到编辑器打开，是否立即安装Office编辑器插件？")) {
      const a = document.createElement("a");
      a.href = "/Setup.msi";
      a.click();
      a.remove();
    }
  }, 1600);
}

async function deleteFile(name: string) {
  if (!confirm(`确定删除「${name}」？`)) return;

  try {
    await $fetch(`/api/files/${encodeURIComponent(name)}`, {
      method: "DELETE",
    });
    showMessage("已删除", "success");
    await fetchFiles();
  } catch {
    showMessage("删除失败", "error");
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

onMounted(fetchFiles);
</script>
