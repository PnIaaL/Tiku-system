package com.java.bank.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.java.bank.dto.AddUserDto;
import com.java.bank.dto.LoginDto;
import com.java.bank.dto.RegisterDto;
import com.java.bank.dto.UpdateUserInfoDto;
import com.java.bank.entity.User;
import com.java.bank.utils.PageResponse;

import java.util.List;


public interface UserService extends IService<User> {

    Boolean checkUsername(String username);

    String login(LoginDto loginDto);

    User getUserByUsername(String username);

    User updateUserInfo(UpdateUserInfoDto updateUserInfoDto);

    PageResponse<User> getUser(String loginName, String trueName, Integer pageNo, Integer pageSize);

    void handlerUser(Integer type, String userIds);

    void addUser(AddUserDto addUserDto);


    List<User> getUserInfoByIds(List<Integer> userIds);

    void register(RegisterDto registerDto);
}
