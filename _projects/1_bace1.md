---
layout: page
title: Dual Pipeline De Novo Design of BACE1 Inhibitors
description: Integrating structure-based SBDD and LBDD for the discovery of novel Alzheimer's disease therapeutics.
img: assets/img/bace1_thumbnail.jpg
importance: 1
category: Generative Therapeutics
---

**Addressing the Alzheimer's Challenge**
The $\beta$-secretase 1 (BACE1) enzyme remains a critical, yet challenging, therapeutic target in the progression of Alzheimer's Disease. Traditional screening methods frequently exhaust known chemical space without yielding leads that possess both high binding affinity and the strict ADME properties required to cross the blood-brain barrier.

**Integrating SBDD and LBDD via Reinforcement Learning**
This project establishes a comprehensive de novo drug design framework that circumvents the limitations of standard screening by hallucinating entirely novel chemical entities. We integrated Structure-Based Drug Design (SBDD) with Ligand-Based Drug Design (LBDD), guided by advanced machine learning architectures.

**Computational Architecture:**
* **Data Curation & QSAR Modeling:** Building highly predictive models to establish strict Applicability Domains (AD) for generated compounds.
* **Dual Generative Pipeline:**
  * *Generative AI:* Fine-tuning generative models with Reinforcement Learning (RL) to explore unmapped chemical space, optimizing simultaneously for binding affinity and drug-likeness.
  * *Genetic Algorithm:* Utilizing docking function to generate highly optimized candidates through structure-based methods.
* **Rigorous Filtering:** Multi-stage ADME/Docking Rescore filtering to ensure all generated candidates possess realistic pharmacokinetic profiles and meaningful interactions.
* **Molecular Dynamics & MM/GBSA Calculation:** Validating the stability of the generated leads within the BACE1 pocket.

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        <img class="img-fluid rounded z-depth-1" src="{{ '/assets/img/bace1_pipeline.png' | relative_url }}" alt="BACE1 Pipeline Overview" />
    </div>
</div>
<div class="caption">
    Figure 1: End-to-end computational pipeline for the de novo generation and optimization of BACE1 inhibitors.
</div>

**Current Status:**
The complete pipeline and generated candidates are documented and currently undergoing peer review for submission to the Journal of Chemical Information and Modeling (JCIM).

**Preprint version:** [ChemRxiv DOI: 10.26434/chemrxiv-2025-bj970](https://chemrxiv.org/doi/full/10.26434/chemrxiv-2025-bj970)