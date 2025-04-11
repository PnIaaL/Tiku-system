package com.java.bank.service;


import cn.hutool.core.lang.tree.Tree;
import com.baomidou.mybatisplus.extension.service.IService;
import com.java.bank.entity.Profession;

import java.util.List;

public interface ProfessionService extends IService<Profession> {

    List<Tree<String>> getBySuGr(String queryText);

    void removeId(Integer id);
}
