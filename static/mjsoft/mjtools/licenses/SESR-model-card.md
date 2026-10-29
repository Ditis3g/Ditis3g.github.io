---
license: apache-2.0
tags:
  - RyzenAI
  - Int8 quantization
  - Single Image Super Resolution
  - SESR
  - ONNX
  - Computer Vision
metrics:
  - PSNR
  - MS_SSIM
  - FID
---

# SESR for 2x Single Image Super Resolution

We provide 2x super-resolution models at resolution 256x256.

It was introduced in the paper _Collapsible Linear Blocks for Super-Efficient Super Resolution_ by Bhardwaj. The official code for this work is available at [sesr](https://github.com/ARM-software/sesr).

We have developed a modified version optimized for [AMD Ryzen AI](https://onnxruntime.ai/docs/execution-providers/Vitis-AI-ExecutionProvider.html).

## Model description

SESR is based on linear overparameterization of CNNs and creates an efficient model architecture for SISR.

## Intended uses & limitations

You can use this model for single image super resolution tasks. See the [model hub](https://huggingface.co/models?search=amd/ryzenai-sesr) for all available models.

## How to use

### Installation

```bash
# inference only
pip install -r requirements-infer.txt
# inference & evaluation
pip install -r requirements-eval.txt
```

### Data Preparation (optional: for evaluation)

Run `python download_edsr_benchmark.py` to automatically download and extract the EDSR benchmark dataset into the datasets directory. After it completes, your datasets folder should have the following structure:

```Plain
datasets/edsr_benchmark
    └── B100
          └── HR
            ├── 3096.png
            ├── ...
          └── LR_bicubic/X2
            ├── 3096x4.png
            ├── ...
    └── Set5
          └── HR
            ├── baby.png
            ├── ...
          └── LR_bicubic/X2
            ├── babyx4.png
            ├── ...
```

### Test & Evaluation

- **Run inference on images**

```bash
python onnx_inference.py --onnx sesr_nchw_fp32.onnx --input /Path/To/Image --out-dir outputs
python onnx_inference.py --onnx sesr_nchw_int8.onnx --input /Path/To/Image --out-dir outputs
```

_Arguments:_

`--input`: Accepts either a single image file path or a directory path. If it's a file, the script will process that image only. If it's a directory, the script will recursively scan for .png, .jpg, and .jpeg files and process all of them.

`--out-dir`: Output directory where the restored images will be saved.

- **Evaluate the quantized model**

_Arguments:_

`--onnx`: Path to the ONNX model file.

`--hq-dir`: Directory containing high-quality (ground truth) images.

`--lq-dir`: Directory containing low-quality (input) images.

`--out-dir`: Output directory where evaluation results will be saved.

`--max-samples`: (Optional) Limit the number of samples to evaluate. Useful for debugging. If not specified, all samples will be evaluated.

`-clean`: (Optional) If specified, the generated super-resolution images will be deleted after evaluation to save disk space.

```bash
# ===================== eval int8 =====================
python onnx_eval.py \
  --onnx sesr_nchw_int8.onnx \
  --hq-dir datasets/edsr_benchmark/Set5/HR \
  --lq-dir datasets/edsr_benchmark/Set5/LR_bicubic/X2 \
  --out-dir outputs/Set5 -clean

python onnx_eval.py \
  --onnx sesr_nchw_int8.onnx \
  --hq-dir datasets/edsr_benchmark/Set14/HR \
  --lq-dir datasets/edsr_benchmark/Set14/LR_bicubic/X2 \
  --out-dir outputs/Set14 -clean

python onnx_eval.py \
  --onnx sesr_nchw_int8.onnx \
  --hq-dir datasets/edsr_benchmark/B100/HR \
  --lq-dir datasets/edsr_benchmark/B100/LR_bicubic/X2 \
  --out-dir outputs/B100 -clean

python onnx_eval.py \
  --onnx sesr_nchw_int8.onnx \
  --hq-dir datasets/edsr_benchmark/Urban100/HR \
  --lq-dir datasets/edsr_benchmark/Urban100/LR_bicubic/X2 \
  --out-dir outputs/Urban100 -clean


# ===================== eval fp32 =====================
python onnx_eval.py \
  --onnx sesr_nchw_fp32.onnx \
  --hq-dir datasets/edsr_benchmark/Set5/HR \
  --lq-dir datasets/edsr_benchmark/Set5/LR_bicubic/X2 \
  --out-dir outputs/Set5 -clean

python onnx_eval.py \
  --onnx sesr_nchw_fp32.onnx \
  --hq-dir datasets/edsr_benchmark/Set14/HR \
  --lq-dir datasets/edsr_benchmark/Set14/LR_bicubic/X2 \
  --out-dir outputs/Set14 -clean

python onnx_eval.py \
  --onnx sesr_nchw_fp32.onnx \
  --hq-dir datasets/edsr_benchmark/B100/HR \
  --lq-dir datasets/edsr_benchmark/B100/LR_bicubic/X2 \
  --out-dir outputs/B100 -clean

python onnx_eval.py \
  --onnx sesr_nchw_fp32.onnx \
  --hq-dir datasets/edsr_benchmark/Urban100/HR \
  --lq-dir datasets/edsr_benchmark/Urban100/LR_bicubic/X2 \
  --out-dir outputs/Urban100 -clean
```

### Performance

| Model      |         | Set5       |        |         | Set14      |        |         | B100        |        |         | Urban100   |        |
| :--------- | ------- | ---------- | ------ | ------- | ---------- | ------ | ------- | ----------- | ------ | ------- | ---------- | ------ |
|            | PSNR(↑) | MS_SSIM(↑) | FID(↓) | PSNR(↑) | MS_SSIM(↑) | FID(↓) | PSNR(↑) | MS_SSIM (↑) | FID(↓) | PSNR(↑) | MS_SSIM(↑) | FID(↓) |
| sesr(fp32) | 35.65   | 0.9971     | 26.46  | 30.98   | 0.9935     | 17.69  | 30.23   | 0.9921      | 17.00  | 28.84   | 0.9929     | 0.25   |
| sesr(int8) | 34.65   | 0.9952     | 28.37  | 30.46   | 0.9916     | 20.70  | 29.80   | 0.9900      | 19.38  | 28.25   | 0.9906     | 1.47   |

---

```bibtex
@article{bhardwaj2021collapsible,
  title={Collapsible Linear Blocks for Super-Efficient Super Resolution},
  author={Bhardwaj, Kartikeya and Milosavljevic, Milos and O'Neil, Liam and Gope, Dibakar and Matas, Ramon and Chalfin, Alex and Suda, Naveen and Meng, Lingchuan and Loh, Danny},
  journal={arXiv preprint arXiv:2103.09404},
  year={2021}
}
```
