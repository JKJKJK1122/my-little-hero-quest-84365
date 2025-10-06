import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';
import { z } from 'zod';

const loginIdSchema = z
  .string()
  .trim()
  .min(3, { message: '아이디는 최소 3자입니다.' })
  .max(20, { message: '아이디는 최대 20자입니다.' })
  .regex(/^[a-zA-Z0-9_]+$/, { message: '영문, 숫자, 밑줄만 사용 가능해요.' });
const passwordSchema = z
  .string()
  .min(6, { message: '비밀번호는 최소 6자입니다.' })
  .max(72, { message: '비밀번호는 최대 72자입니다.' });
const nicknameSchema = z
  .string()
  .trim()
  .min(1, { message: '닉네임을 입력해주세요.' })
  .max(20, { message: '닉네임은 최대 20자입니다.' });
const makeEmailFromId = (id: string) => `${id}@user.local`;

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // 이미 로그인된 경우 메인 메뉴로 리디렉션
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/main-menu');
      }
    });

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/main-menu');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // SEO 설정
  useEffect(() => {
    document.title = '로그인/회원가입 - 똑똑한 선택왕';
    const content = '아이디와 비밀번호로 간편하게 로그인하고 회원가입하세요.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const idCheck = loginIdSchema.safeParse(loginId);
    const passCheck = passwordSchema.safeParse(password);
    const nameCheck = nicknameSchema.safeParse(username);

    if (!idCheck.success) {
      toast({ title: '입력 오류', description: idCheck.error.issues[0].message, variant: 'destructive' });
      return;
    }
    if (!passCheck.success) {
      toast({ title: '비밀번호 오류', description: passCheck.error.issues[0].message, variant: 'destructive' });
      return;
    }
    if (!nameCheck.success) {
      toast({ title: '닉네임 오류', description: nameCheck.error.issues[0].message, variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/main-menu`;
      const syntheticEmail = makeEmailFromId(loginId);

      const { error } = await supabase.auth.signUp({
        email: syntheticEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username,
            login_id: loginId,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: '회원가입 실패',
            description: '이미 사용 중인 아이디예요.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        setIsLoading(false);
        return;
      }

      toast({
        title: '회원가입 성공! 🎉',
        description: '환영합니다! 첫 번째 알을 받았어요!',
      });
      // onAuthStateChange에서 navigate 처리
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: '회원가입 실패',
        description: error.message || '회원가입 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const idCheck = loginIdSchema.safeParse(loginId);
    const passCheck = passwordSchema.safeParse(password);

    if (!idCheck.success || !passCheck.success) {
      toast({
        title: '입력 오류',
        description: !idCheck.success ? idCheck.error.issues[0].message : passCheck.error.issues[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const syntheticEmail = makeEmailFromId(loginId);
      const { error } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: '로그인 실패',
            description: '아이디 또는 비밀번호가 올바르지 않습니다.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        setIsLoading(false);
        return;
      }

      toast({
        title: '로그인 성공! 👋',
        description: '다시 만나서 반가워요!',
      });

      // navigate는 onAuthStateChange에서 처리됨
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: '로그인 실패',
        description: error.message || '로그인 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            똑똑한 선택왕
          </h1>
          <p className="text-muted-foreground">
            펫과 함께 올바른 선택을 배워요!
          </p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-id">아이디</Label>
                  <Input
                    id="signin-id"
                    type="text"
                    placeholder="아이디"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">비밀번호</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      로그인 중...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn size={18} />
                      로그인
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">닉네임</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="멋진 이름을 지어주세요"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-id">아이디</Label>
                  <Input
                    id="signup-id"
                    type="text"
                    placeholder="영문, 숫자, 밑줄 3-20자"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="최소 6자 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      가입 중...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserPlus size={18} />
                      회원가입
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* 안내 메시지 */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                회원가입하면 좋은 점
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 첫 번째 펫 알을 무료로 받아요!</li>
                <li>• 게임 진행 상황이 저장돼요</li>
                <li>• 펫을 키우고 컬렉션을 모아요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
