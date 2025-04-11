package com.java.bank.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.java.bank.entity.UserRole;

import java.util.List;

public interface UserRoleService extends IService<UserRole> {

    String getMenuInfo(Integer roleId);

    List<UserRole> getUserRole();
}
